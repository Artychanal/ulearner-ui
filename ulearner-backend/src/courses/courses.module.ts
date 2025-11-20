import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CourseEntity } from './entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CourseEntity, LessonEntity, InstructorEntity])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
