import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { TestimonialFiltersDto } from './dto/testimonial-filters.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { TestimonialEntity } from './entities/testimonial.entity';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly testimonialRepository: Repository<TestimonialEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  async findAll(filters: TestimonialFiltersDto) {
    const { limit = 25, offset = 0, courseId } = filters;
    const qb = this.testimonialRepository
      .createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.course', 'course')
      .orderBy('testimonial.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (courseId) {
      qb.andWhere('testimonial.course_id = :courseId', { courseId });
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      meta: { total, limit, offset },
    };
  }

  async findOne(id: string) {
    const testimonial = await this.testimonialRepository.findOne({
      where: { id },
      relations: { course: true },
    });

    if (!testimonial) {
      throw new NotFoundException(`Testimonial ${id} was not found`);
    }

    return testimonial;
  }

  async create(dto: CreateTestimonialDto) {
    const testimonial = this.testimonialRepository.create({
      ...dto,
    });

    if (dto.courseId) {
      testimonial.course = await this.findCourse(dto.courseId);
    }

    return this.testimonialRepository.save(testimonial);
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.findOne(id);

    if (dto.courseId) {
      testimonial.course = await this.findCourse(dto.courseId);
    }

    Object.assign(testimonial, dto);
    return this.testimonialRepository.save(testimonial);
  }

  async remove(id: string) {
    const testimonial = await this.findOne(id);
    await this.testimonialRepository.remove(testimonial);
    return { id };
  }

  private async findCourse(id: string) {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course ${id} was not found`);
    }
    return course;
  }
}
