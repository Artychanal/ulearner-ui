import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class QuizQuestionDto {
  @IsString()
  readonly id!: string;

  @IsString()
  readonly question!: string;

  @IsInt()
  @Min(0)
  readonly points!: number;

  @IsArray()
  @IsString({ each: true })
  readonly options!: string[];

  @IsInt()
  @Min(0)
  readonly answerIndex!: number;
}

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
  @IsUUID()
  readonly mediaId?: string;

  @IsOptional()
  @IsNumber()
  readonly totalPoints?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  readonly questions?: QuizQuestionDto[];
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
