import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller({ path: 'courses/:courseId/reviews', version: '1' })
export class CourseReviewsController {
  constructor(private readonly courseReviewsService: CourseReviewsService) {}

  @Get()
  async list(@Param('courseId', new ParseUUIDPipe()) courseId: string) {
    return this.courseReviewsService.listForCourse(courseId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Param('courseId', new ParseUUIDPipe()) courseId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateCourseReviewDto,
  ) {
    return this.courseReviewsService.createOrUpdate(courseId, userId, dto);
  }
}
