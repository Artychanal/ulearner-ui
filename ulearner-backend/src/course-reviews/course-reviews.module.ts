import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseReviewsService } from './course-reviews.service';
import { CourseReviewsController } from './course-reviews.controller';
import { CourseReviewEntity } from './entities/course-review.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseReviewEntity, CourseEntity, UserEntity, EnrollmentEntity])],
  controllers: [CourseReviewsController],
  providers: [CourseReviewsService],
  exports: [CourseReviewsService],
})
export class CourseReviewsModule {}
