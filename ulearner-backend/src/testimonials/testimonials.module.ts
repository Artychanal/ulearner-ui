import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseEntity } from '../courses/entities/course.entity';
import { TestimonialsController } from './testimonials.controller';
import { TestimonialsService } from './testimonials.service';
import { TestimonialEntity } from './entities/testimonial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestimonialEntity, CourseEntity])],
  controllers: [TestimonialsController],
  providers: [TestimonialsService],
})
export class TestimonialsModule {}
