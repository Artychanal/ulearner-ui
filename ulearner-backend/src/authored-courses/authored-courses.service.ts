import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { CourseReviewEntity } from '../course-reviews/entities/course-review.entity';
import { CreateAuthoredCourseDto } from './dto/create-authored-course.dto';
import { UpdateAuthoredCourseDto } from './dto/update-authored-course.dto';
import { CourseModuleDto } from './dto/course-module.dto';

@Injectable()
export class AuthoredCoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,
    @InjectRepository(InstructorEntity)
    private readonly instructorRepository: Repository<InstructorEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    @InjectRepository(CourseReviewEntity)
    private readonly reviewRepository: Repository<CourseReviewEntity>,
  ) {}

  listForOwner(ownerId: string) {
    return this.courseRepository.find({
      where: { owner: { id: ownerId } },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOwnedCourse(ownerId: string, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, owner: { id: ownerId } },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async create(ownerId: string, dto: CreateAuthoredCourseDto) {
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('User not found');
    }

    const instructorName = this.resolveInstructorName(owner, dto.instructor);
    const instructor = await this.ensureInstructor(owner, instructorName);
    const lessons = this.buildLessonsFromModules(dto.modules);

    const course = this.courseRepository.create({
      title: dto.title,
      description: dto.description,
      price: dto.price,
      category: dto.category,
      imageUrl: dto.imageUrl,
      isPublished: dto.isPublished,
      instructor,
      owner,
      editorModules: dto.modules,
      lessons: lessons.map((lesson, index) =>
        this.lessonRepository.create({
          title: lesson.title,
          durationMinutes: lesson.durationMinutes,
          position: index + 1,
          videoUrl: lesson.videoUrl,
          videoMediaId: lesson.videoMediaId,
        }),
      ),
    });

    const saved = await this.courseRepository.save(course);
    return this.findOwnedCourse(ownerId, saved.id);
  }

  async update(ownerId: string, courseId: string, dto: UpdateAuthoredCourseDto) {
    const course = await this.findOwnedCourse(ownerId, courseId);

    if (dto.title !== undefined) {
      course.title = dto.title;
    }
    if (dto.description !== undefined) {
      course.description = dto.description;
    }
    if (dto.price !== undefined) {
      course.price = dto.price;
    }
    if (dto.category !== undefined) {
      course.category = dto.category;
    }
    if (dto.imageUrl !== undefined) {
      course.imageUrl = dto.imageUrl;
    }
    if (dto.isPublished !== undefined) {
      course.isPublished = dto.isPublished;
    }
    if (dto.instructor !== undefined) {
      const owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        throw new NotFoundException('User not found');
      }
      const instructorName = this.resolveInstructorName(owner, dto.instructor);
      course.instructor = await this.ensureInstructor(owner, instructorName);
    }
    if (dto.modules !== undefined) {
      course.editorModules = dto.modules;
      const lessons = this.buildLessonsFromModules(dto.modules);
      await this.lessonRepository.delete({ course: { id: course.id } });
      course.lessons = lessons.map((lesson, index) =>
        this.lessonRepository.create({
          title: lesson.title,
          durationMinutes: lesson.durationMinutes,
          position: index + 1,
          course,
          videoUrl: lesson.videoUrl,
          videoMediaId: lesson.videoMediaId,
        }),
      );
    }

    await this.courseRepository.save(course);
    return this.findOwnedCourse(ownerId, courseId);
  }

  async remove(ownerId: string, courseId: string) {
    const course = await this.findOwnedCourse(ownerId, courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    await this.lessonRepository.delete({ course: { id: course.id } });
    await this.courseRepository.remove(course);
    return { id: courseId };
  }

  async analytics(ownerId: string, courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, owner: { id: ownerId } },
      relations: { lessons: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const [enrollments, reviews] = await Promise.all([
      this.enrollmentRepository.find({
        where: { course: { id: courseId } },
      }),
      this.reviewRepository.find({
        where: { course: { id: courseId } },
      }),
    ]);

    const enrolled = enrollments.length;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const activeThisWeek = enrollments.filter((enrollment) => enrollment.lastAccessed.getTime() >= weekAgo).length;
    const averageProgress =
      enrolled === 0 ? 0 : enrollments.reduce((sum, enrollment) => sum + (enrollment.progress ?? 0), 0) / enrolled;
    const completionRate =
      enrolled === 0
        ? 0
        : (enrollments.filter((enrollment) => (enrollment.progress ?? 0) >= 90).length / enrolled) * 100;

    const reviewsCount = reviews.length;
    const averageRating =
      reviewsCount === 0 ? 0 : reviews.reduce((sum, review) => sum + (review.rating ?? 0), 0) / reviewsCount;

    const lastEnrollment = enrollments.reduce<Date | null>((latest, enrollment) => {
      if (!enrollment.createdAt) {
        return latest;
      }
      if (!latest || enrollment.createdAt > latest) {
        return enrollment.createdAt;
      }
      return latest;
    }, null);

    const lastReview = reviews.reduce<Date | null>((latest, review) => {
      if (!review.createdAt) {
        return latest;
      }
      if (!latest || review.createdAt > latest) {
        return review.createdAt;
      }
      return latest;
    }, null);

    return {
      courseId,
      lessonsCount: course.lessons?.length ?? 0,
      enrolled,
      activeThisWeek,
      averageProgress: Number(averageProgress.toFixed(1)),
      completionRate: Number(completionRate.toFixed(1)),
      reviewsCount,
      averageRating: Number(averageRating.toFixed(1)),
      lastEnrollment: lastEnrollment ?? null,
      lastReview: lastReview ?? null,
      lastUpdated: course.updatedAt ?? null,
    };
  }

  private async ensureInstructor(owner: UserEntity, instructorName: string) {
    let instructor = await this.instructorRepository.findOne({ where: { email: owner.email.toLowerCase() } });
    if (!instructor) {
      instructor = this.instructorRepository.create({
        name: instructorName,
        email: owner.email.toLowerCase(),
        avatarUrl: owner.avatarUrl,
        title: 'Course Author',
        bio: owner.bio,
      });
      return this.instructorRepository.save(instructor);
    }

    if (instructor.name !== instructorName) {
      instructor.name = instructorName;
      instructor = await this.instructorRepository.save(instructor);
    }
    return instructor;
  }

  private buildLessonsFromModules(modules: CourseModuleDto[] = []) {
    const lessons: { title: string; durationMinutes: number; videoUrl?: string; videoMediaId?: string }[] = [];

    modules.forEach((module) => {
      module.items.forEach((item) => {
        let durationMinutes = 5;
        let videoUrl: string | undefined;
        let videoMediaId: string | undefined;
        if (item.type === 'video') {
          durationMinutes = this.parseDuration(item.duration);
          videoUrl = typeof item.url === 'string' ? item.url : undefined;
          videoMediaId = typeof item.mediaId === 'string' ? item.mediaId : undefined;
        }
        lessons.push({
          title: `${module.title} — ${item.title}`,
          durationMinutes,
          videoUrl,
          videoMediaId,
        });
      });
    });

    if (lessons.length === 0) {
      return [
        {
          title: 'Introduction',
          durationMinutes: 5,
        },
      ];
    }

    return lessons;
  }

  private parseDuration(duration?: string) {
    if (!duration) {
      return 5;
    }
    const [minutesStr, secondsStr] = duration.split(':');
    const minutes = Number(minutesStr);
    const seconds = secondsStr ? Number(secondsStr) : 0;
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return 5;
    }
    return minutes + Math.round(seconds / 60);
  }

  private resolveInstructorName(owner: UserEntity, requested?: string | null) {
    const trimmed = requested?.trim();
    if (!trimmed || trimmed.toLowerCase() === 'you') {
      return owner.name;
    }
    return trimmed;
  }
}
