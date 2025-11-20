import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { CourseReviewEntity } from '../course-reviews/entities/course-review.entity';
import { TestimonialEntity } from '../testimonials/entities/testimonial.entity';

@Injectable()
export class AdminStatsService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    @InjectRepository(CourseReviewEntity)
    private readonly reviewRepository: Repository<CourseReviewEntity>,
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepository: Repository<TestimonialEntity>,
  ) {}

  async getOverview() {
    const [courses, lessons, users, enrollments, reviews, testimonials] = await Promise.all([
      this.courseRepository.count(),
      this.lessonRepository.count(),
      this.userRepository.count(),
      this.enrollmentRepository.count(),
      this.reviewRepository.count(),
      this.testimonialRepository.count(),
    ]);

    return {
      courses,
      lessons,
      users,
      enrollments,
      reviews,
      testimonials,
    };
  }
}
