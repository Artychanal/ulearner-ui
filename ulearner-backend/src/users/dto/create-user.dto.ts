import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  readonly name!: string;

  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(6)
  readonly password!: string;

  @IsOptional()
  @IsString()
  readonly avatarUrl?: string;

  @IsOptional()
  @IsString()
  readonly bio?: string;
}
