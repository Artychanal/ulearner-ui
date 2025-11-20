import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID()
  readonly courseId!: string;

  @IsOptional()
  @IsEnum(['catalog', 'authored'])
  readonly origin?: 'catalog' | 'authored';
}
