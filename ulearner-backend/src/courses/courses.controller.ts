import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CourseFiltersDto } from './dto/course-filters.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CoursesService } from './courses.service';
import { CreateLessonDto } from '../lessons/dto/create-lesson.dto';
import { UpdateLessonDto } from '../lessons/dto/update-lesson.dto';

@Controller({
  path: 'courses',
  version: '1',
})
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  findAll(@Query() filters: CourseFiltersDto) {
    return this.coursesService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateCourseDto) {
    return this.coursesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/lessons')
  addLesson(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: CreateLessonDto,
  ) {
    return this.coursesService.addLesson(id, dto);
  }

  @Patch(':courseId/lessons/:lessonId')
  updateLesson(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.coursesService.updateLesson(courseId, lessonId, dto);
  }

  @Delete(':courseId/lessons/:lessonId')
  removeLesson(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @Param('lessonId', new ParseUUIDPipe()) lessonId: string,
  ) {
    return this.coursesService.removeLesson(courseId, lessonId);
  }
}
