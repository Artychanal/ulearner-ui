import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseReviewEntity } from './entities/course-review.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { CourseReviewResponseDto, CourseReviewSummaryDto } from './dto/course-review-response.dto';

@Injectable()
export class CourseReviewsService {
  constructor(
    @InjectRepository(CourseReviewEntity)
    private readonly reviewRepository: Repository<CourseReviewEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
  ) {}

  async ensureCourse(courseId: string) {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async listForCourse(courseId: string): Promise<CourseReviewSummaryDto> {
    await this.ensureCourse(courseId);

    const [reviews, aggregate] = await Promise.all([
      this.reviewRepository.find({
        where: { course: { id: courseId } },
        relations: { author: true },
        order: { createdAt: 'DESC' },
      }),
      this.reviewRepository
        .createQueryBuilder('review')
        .select('AVG(review.rating)', 'avg')
        .addSelect('COUNT(review.id)', 'count')
        .where('review.course_id = :courseId', { courseId })
        .getRawOne<{ avg: string | null; count: string | null }>(),
    ]);

    const avg = aggregate?.avg ? parseFloat(aggregate.avg) : 0;
    const count = aggregate?.count ? parseInt(aggregate.count, 10) : 0;

    return {
      averageRating: Number.isNaN(avg) ? 0 : Number(avg.toFixed(1)),
      totalReviews: Number.isNaN(count) ? 0 : count,
      reviews: reviews.map(CourseReviewResponseDto.fromEntity),
    };
  }

  async createOrUpdate(courseId: string, userId: string, dto: CreateCourseReviewDto) {
    const course = await this.ensureCourse(courseId);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const enrollment = await this.enrollmentRepository.findOne({
      where: { course: { id: courseId }, user: { id: userId } },
    });

    if (!enrollment || enrollment.progress < 100) {
      throw new ForbiddenException('Complete the course to leave a review');
    }

    let review = await this.reviewRepository.findOne({
      where: { course: { id: courseId }, author: { id: userId } },
      relations: { author: true },
    });

    if (review) {
      review.rating = dto.rating;
      review.comment = dto.comment?.trim() || null;
    } else {
      review = this.reviewRepository.create({
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        course,
        author: user,
      });
    }

    const saved = await this.reviewRepository.save(review);
    return CourseReviewResponseDto.fromEntity(saved);
  }
}
