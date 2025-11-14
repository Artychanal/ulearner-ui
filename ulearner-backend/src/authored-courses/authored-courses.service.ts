import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { UserEntity } from '../users/entities/user.entity';
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

    const instructor = await this.ensureInstructor(owner, dto.instructor);
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
        }),
      ),
    });

    return this.courseRepository.save(course);
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
      course.instructor = await this.ensureInstructor(owner, dto.instructor);
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
        }),
      );
    }

    return this.courseRepository.save(course);
  }

  async remove(ownerId: string, courseId: string) {
    const course = await this.findOwnedCourse(ownerId, courseId);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    await this.courseRepository.remove(course);
    return { id: courseId };
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
    const lessons: { title: string; durationMinutes: number }[] = [];

    modules.forEach((module) => {
      module.items.forEach((item) => {
        let durationMinutes = 5;
        if (item.type === 'video') {
          durationMinutes = this.parseDuration(item.duration);
        }
        lessons.push({
          title: `${module.title} — ${item.title}`,
          durationMinutes,
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
}
