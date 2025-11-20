import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCourseReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  readonly rating!: number;

  @IsOptional()
  @IsString()
  readonly comment?: string;
}
