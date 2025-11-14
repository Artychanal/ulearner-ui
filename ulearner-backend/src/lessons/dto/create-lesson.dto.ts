import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  readonly title!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(600)
  readonly durationMinutes!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly position?: number;

  @IsOptional()
  @IsString()
  readonly videoUrl?: string;
}
