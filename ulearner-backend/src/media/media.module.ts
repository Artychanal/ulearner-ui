import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MediaEntity } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
