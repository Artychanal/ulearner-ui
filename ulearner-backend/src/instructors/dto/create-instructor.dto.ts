import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateInstructorDto {
  @IsString()
  @MaxLength(120)
  readonly name!: string;

  @IsEmail()
  @MaxLength(180)
  readonly email!: string;

  @IsString()
  @MaxLength(120)
  readonly title!: string;

  @IsOptional()
  @IsString()
  readonly bio?: string;

  @IsOptional()
  @IsString()
  readonly avatarUrl?: string;

  @IsOptional()
  @IsString()
  readonly twitter?: string;

  @IsOptional()
  @IsString()
  readonly linkedin?: string;
}
