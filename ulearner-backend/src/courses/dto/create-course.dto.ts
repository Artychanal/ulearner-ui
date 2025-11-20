import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateLessonDto } from '../../lessons/dto/create-lesson.dto';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  readonly title!: string;

  @IsString()
  @IsNotEmpty()
  readonly description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  readonly price!: number;

  @IsString()
  @IsNotEmpty()
  readonly category!: string;

  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @IsUUID()
  readonly instructorId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  readonly lessons!: CreateLessonDto[];
}
