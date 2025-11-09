import { IsEmail, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateTestimonialDto {
  @IsString()
  @MaxLength(120)
  readonly userName!: string;

  @IsEmail()
  @MaxLength(180)
  readonly userEmail!: string;

  @IsOptional()
  @IsString()
  readonly userAvatar?: string;

  @IsString()
  readonly statement!: string;

  @IsOptional()
  @IsUUID()
  readonly courseId?: string;
}
