import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AdminMediaController } from './admin-media.controller';
import { AdminSessionGuard } from './guards/admin-session.guard';

@Module({
  imports: [MediaModule],
  controllers: [AdminMediaController],
  providers: [AdminSessionGuard],
})
export class AdminApiModule {}
