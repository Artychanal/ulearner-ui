import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class TestimonialFiltersDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  courseId?: string;
}
