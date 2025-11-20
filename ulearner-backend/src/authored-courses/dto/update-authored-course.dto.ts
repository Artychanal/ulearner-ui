import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthoredCourseDto } from './create-authored-course.dto';

export class UpdateAuthoredCourseDto extends PartialType(CreateAuthoredCourseDto) {}
