import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaModule } from '../media/media.module';
import { AdminMediaController } from './admin-media.controller';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { CourseReviewEntity } from '../course-reviews/entities/course-review.entity';
import { TestimonialEntity } from '../testimonials/entities/testimonial.entity';

@Module({
  imports: [
    MediaModule,
    TypeOrmModule.forFeature([
      CourseEntity,
      LessonEntity,
      UserEntity,
      EnrollmentEntity,
      CourseReviewEntity,
      TestimonialEntity,
    ]),
  ],
  controllers: [AdminMediaController, AdminStatsController],
  providers: [AdminSessionGuard, AdminStatsService],
})
export class AdminApiModule {}
