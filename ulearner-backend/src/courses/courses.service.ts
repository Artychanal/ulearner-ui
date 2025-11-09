import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseFiltersDto } from './dto/course-filters.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseEntity } from './entities/course.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { CreateLessonDto } from '../lessons/dto/create-lesson.dto';
import { UpdateLessonDto } from '../lessons/dto/update-lesson.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
    @InjectRepository(LessonEntity)
    private readonly lessonRepository: Repository<LessonEntity>,
    @InjectRepository(InstructorEntity)
    private readonly instructorRepository: Repository<InstructorEntity>,
  ) {}

  async findAll(filters: CourseFiltersDto) {
    const { limit = 25, offset = 0, category, instructorId, search, minPrice, maxPrice } = filters;

    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.lessons', 'lesson')
      .orderBy('course.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (category) {
      qb.andWhere('LOWER(course.category) = LOWER(:category)', { category });
    }

    if (search) {
      qb.andWhere(
        '(LOWER(course.title) LIKE LOWER(:search) OR LOWER(course.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );
    }

    if (instructorId) {
      qb.andWhere('course.instructor_id = :instructorId', { instructorId });
    }

    if (minPrice !== undefined) {
      qb.andWhere('course.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      qb.andWhere('course.price <= :maxPrice', { maxPrice });
    }

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      meta: {
        total,
        limit,
        offset,
      },
    };
  }

  async findOne(id: string) {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        instructor: true,
        lessons: true,
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${id} was not found`);
    }

    return course;
  }

  async create(dto: CreateCourseDto) {
    const instructor = await this.findInstructor(dto.instructorId);
    const course = this.courseRepository.create({
      ...dto,
      instructor,
      lessons: dto.lessons.map((lesson, index) =>
        this.lessonRepository.create({
          ...lesson,
          position: lesson.position ?? index + 1,
        }),
      ),
    });
    return this.courseRepository.save(course);
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.findOne(id);

    if (dto.instructorId && dto.instructorId !== course.instructor.id) {
      course.instructor = await this.findInstructor(dto.instructorId);
    }

    const { lessons, ...rest } = dto;
    Object.assign(course, rest);

    if (lessons) {
      await this.lessonRepository.delete({ course: { id: course.id } });
      course.lessons = lessons.map((lesson, index) =>
        this.lessonRepository.create({
          ...lesson,
          position: lesson.position ?? index + 1,
          course,
        }),
      );
    }

    return this.courseRepository.save(course);
  }

  async remove(id: string) {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
    return { id };
  }

  async addLesson(courseId: string, dto: CreateLessonDto) {
    const course = await this.findOne(courseId);
    const lesson = this.lessonRepository.create({
      ...dto,
      position: dto.position ?? (course.lessons?.length ?? 0) + 1,
      course,
    });
    return this.lessonRepository.save(lesson);
  }

  async updateLesson(courseId: string, lessonId: string, dto: UpdateLessonDto) {
    await this.findOne(courseId);
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId, course: { id: courseId } },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} was not found`);
    }

    Object.assign(lesson, dto);
    return this.lessonRepository.save(lesson);
  }

  async removeLesson(courseId: string, lessonId: string) {
    await this.findOne(courseId);
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId, course: { id: courseId } },
    });
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} was not found`);
    }

    await this.lessonRepository.remove(lesson);
    return { id: lessonId };
  }

  private async findInstructor(id: string) {
    const instructor = await this.instructorRepository.findOne({ where: { id } });
    if (!instructor) {
      throw new NotFoundException(`Instructor ${id} was not found`);
    }
    return instructor;
  }
}
