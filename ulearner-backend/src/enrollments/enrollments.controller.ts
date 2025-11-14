import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Controller({ path: 'enrollments', version: '1' })
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Get('me')
  list(@CurrentUser('userId') userId: string) {
    return this.enrollmentsService.listForUser(userId);
  }

  @Post()
  join(@CurrentUser('userId') userId: string, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.joinCourse(userId, dto);
  }

  @Patch('progress')
  update(@CurrentUser('userId') userId: string, @Body() dto: UpdateProgressDto) {
    return this.enrollmentsService.updateProgress(userId, dto);
  }
}
