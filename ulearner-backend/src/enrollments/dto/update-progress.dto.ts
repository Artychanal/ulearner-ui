import { IsArray, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class UpdateProgressDto {
  @IsUUID()
  readonly enrollmentId!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  readonly progress!: number;

  @IsArray()
  readonly completedLessons!: string[];

  @IsArray()
  @IsOptional()
  readonly quizAttempts?: unknown[];
}
