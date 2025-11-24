import {
  BadRequestException,
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { MediaService } from '../media/media.service';
import { AdminSessionGuard } from './guards/admin-session.guard';

@Controller({ path: 'admin/media', version: '1' })
@UseGuards(AdminSessionGuard)
export class AdminMediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFromAdmin(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const media = await this.mediaService.create(file);
    return {
      id: media.id,
      filename: media.filename,
      mimeType: media.mimeType,
      size: media.size,
      url: this.mediaService.buildPublicUrl(media.id),
      createdAt: media.createdAt,
    };
  }
}
