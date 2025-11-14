import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { Response } from 'express';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MediaService } from './media.service';

@Controller({ path: 'media', version: '1' })
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('userId') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    this.logger.log(
      `Upload requested by ${userId} -> ${file.originalname} (${file.mimetype}, ${file.size} bytes)`,
    );

    const media = await this.mediaService.create(file, userId);
    return {
      id: media.id,
      filename: media.filename,
      mimeType: media.mimeType,
      size: media.size,
      url: this.mediaService.buildPublicUrl(media.id),
      createdAt: media.createdAt,
    };
  }

  @Get(':id')
  async serve(@Param('id') id: string, @Res() response: Response) {
    const media = await this.mediaService.findOne(id);
    response.setHeader('Content-Type', media.mimeType);
    response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    response.setHeader('Content-Length', media.size.toString());

    if (media.storagePath) {
      const stream = this.mediaService.createStorageStream(media.storagePath);
      stream.on('error', () => {
        response.status(404).end();
      });
      stream.pipe(response);
      return;
    }

    if (media.data) {
      response.end(media.data);
      return;
    }

    throw new NotFoundException('Media data is not available');
  }
}
