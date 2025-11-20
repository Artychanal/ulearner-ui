import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthoredCoursesService } from './authored-courses.service';
import { AuthoredCoursesController } from './authored-courses.controller';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { CourseReviewEntity } from '../course-reviews/entities/course-review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      LessonEntity,
      InstructorEntity,
      UserEntity,
      EnrollmentEntity,
      CourseReviewEntity,
    ]),
  ],
  controllers: [AuthoredCoursesController],
  providers: [AuthoredCoursesService],
})
export class AuthoredCoursesModule {}
