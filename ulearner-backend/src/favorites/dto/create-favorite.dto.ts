import { IsEnum, IsUUID } from 'class-validator';

export class ToggleFavoriteDto {
  @IsUUID()
  readonly courseId!: string;

  @IsEnum(['catalog', 'authored'])
  readonly origin!: 'catalog' | 'authored';
}
