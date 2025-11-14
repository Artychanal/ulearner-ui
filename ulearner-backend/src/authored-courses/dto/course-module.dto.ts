import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

class CourseContentItemDto {
  @IsString()
  readonly id!: string;

  @IsString()
  readonly type!: string;

  @IsString()
  readonly title!: string;

  @IsOptional()
  readonly body?: string;

  @IsOptional()
  readonly url?: string;

  @IsOptional()
  readonly duration?: string;

  @IsOptional()
  readonly totalPoints?: number;

  @IsOptional()
  readonly questions?: unknown[];
}

export class CourseModuleDto {
  @IsString()
  readonly id!: string;

  @IsString()
  readonly title!: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsArray()
  @Type(() => CourseContentItemDto)
  readonly items!: CourseContentItemDto[];
}

export class BaseAuthoredCourseDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  readonly instructor!: string;

  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @IsNumber()
  @Min(0)
  readonly price!: number;

  @IsString()
  @IsNotEmpty()
  readonly category!: string;

  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @IsBoolean()
  readonly isPublished!: boolean;

  @IsArray()
  @Type(() => CourseModuleDto)
  readonly modules!: CourseModuleDto[];
}
