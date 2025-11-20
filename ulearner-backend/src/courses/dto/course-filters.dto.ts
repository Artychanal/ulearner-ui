import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CourseFiltersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  instructorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}
