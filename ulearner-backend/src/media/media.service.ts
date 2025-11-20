import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { MediaEntity } from './entities/media.entity';
import { UserEntity } from '../users/entities/user.entity';
import type { Express } from 'express';

@Injectable()
export class MediaService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
    private readonly configService: ConfigService,
  ) {
    const configuredDir = this.configService.get<string>('media.uploadDir') ?? 'uploads/media';
    const resolvedDir = path.isAbsolute(configuredDir)
      ? path.normalize(configuredDir)
      : path.resolve(process.cwd(), configuredDir);
    this.uploadDir = resolvedDir;
  }

  private async ensureUploadDirExists() {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  private getAbsolutePath(relativePath: string) {
    if (!relativePath || path.isAbsolute(relativePath)) {
      throw new BadRequestException('Invalid media path');
    }
    const normalized = path.normalize(relativePath);
    const resolved = path.resolve(this.uploadDir, normalized);
    const diff = path.relative(this.uploadDir, resolved);
    if (diff.startsWith('..') || path.isAbsolute(diff)) {
      throw new BadRequestException('Invalid media path');
    }
    return resolved;
  }

  async create(file: Express.Multer.File, uploaderId?: string) {
    await this.ensureUploadDirExists();
    let buffer: Buffer | undefined = file.buffer;
    if (!buffer && file.path) {
      try {
        buffer = await fs.readFile(file.path);
        await fs.unlink(file.path);
      } catch {
        throw new InternalServerErrorException('Failed to process uploaded file');
      }
    }

    if (!buffer) {
      throw new InternalServerErrorException('File buffer is missing');
    }

    const extension = path.extname(file.originalname) || '';
    const storedFileName = `${randomUUID()}${extension}`;
    const absolutePath = this.getAbsolutePath(storedFileName);

    try {
      await fs.writeFile(absolutePath, buffer);
    } catch {
      throw new InternalServerErrorException('Failed to persist uploaded file');
    }

    const entity = this.mediaRepository.create({
      filename: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size,
      data: null,
      storagePath: storedFileName,
      uploader: uploaderId ? ({ id: uploaderId } as UserEntity) : undefined,
    });

    return this.mediaRepository.save(entity);
  }

  async findOne(id: string) {
    const media = await this.mediaRepository.findOne({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  buildPublicUrl(mediaId: string) {
    const baseUrl = this.configService.get<string>('media.baseUrl') ?? '';
    return `${baseUrl.replace(/\/$/, '')}/api/v1/media/${mediaId}`;
  }

  createStorageStream(storagePath: string) {
    const absolutePath = this.getAbsolutePath(storagePath);
    return createReadStream(absolutePath);
  }
}
