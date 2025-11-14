import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { CourseEntity } from '../courses/entities/course.entity';
import { UserEntity } from '../users/entities/user.entity';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async listForUser(userId: string) {
    return this.enrollmentRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { updatedAt: 'DESC' },
    });
  }

  async joinCourse(userId: string, dto: CreateEnrollmentDto) {
    const existing = await this.enrollmentRepository.findOne({
      where: { user: { id: userId }, course: { id: dto.courseId } },
    });
    if (existing) {
      throw new ConflictException('You are already enrolled in this course');
    }

    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const userRef = { id: userId } as UserEntity;
    const enrollment = this.enrollmentRepository.create({
      user: userRef,
      course,
      progress: 0,
      completedLessons: [],
      quizAttempts: [],
      origin: dto.origin ?? 'catalog',
    });

    return this.enrollmentRepository.save(enrollment);
  }

  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: dto.enrollmentId, user: { id: userId } },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    enrollment.progress = dto.progress;
    enrollment.completedLessons = dto.completedLessons;
    enrollment.quizAttempts = dto.quizAttempts ?? enrollment.quizAttempts;
    enrollment.lastAccessed = new Date();

    return this.enrollmentRepository.save(enrollment);
  }
}
