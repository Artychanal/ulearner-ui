import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthoredCoursesService } from './authored-courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAuthoredCourseDto } from './dto/create-authored-course.dto';
import { UpdateAuthoredCourseDto } from './dto/update-authored-course.dto';
import { AuthoredCourseResponseDto } from './dto/authored-course-response.dto';

@Controller({ path: 'me/courses', version: '1' })
@UseGuards(JwtAuthGuard)
export class AuthoredCoursesController {
  constructor(private readonly authoredCoursesService: AuthoredCoursesService) {}

  @Get()
  async list(@CurrentUser('userId') userId: string) {
    const courses = await this.authoredCoursesService.listForOwner(userId);
    return courses.map(AuthoredCourseResponseDto.fromEntity);
  }

  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateAuthoredCourseDto,
  ) {
    const course = await this.authoredCoursesService.create(userId, dto);
    return AuthoredCourseResponseDto.fromEntity(course);
  }

  @Get(':id')
  async getOne(@CurrentUser('userId') userId: string, @Param('id', new ParseUUIDPipe()) id: string) {
    const course = await this.authoredCoursesService.findOwnedCourse(userId, id);
    return AuthoredCourseResponseDto.fromEntity(course);
  }

  @Patch(':id')
  async update(
    @CurrentUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAuthoredCourseDto,
  ) {
    const course = await this.authoredCoursesService.update(userId, id, dto);
    return AuthoredCourseResponseDto.fromEntity(course);
  }

  @Delete(':id')
  remove(@CurrentUser('userId') userId: string, @Param('id', new ParseUUIDPipe()) id: string) {
    return this.authoredCoursesService.remove(userId, id);
  }
}
