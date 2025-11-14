import { CourseEntity } from '../../courses/entities/course.entity';

export class AuthoredCourseResponseDto {
  id!: string;
  title!: string;
  instructor!: string;
  description!: string;
  price!: number;
  category!: string;
  imageUrl?: string;
  isPublished!: boolean;
  modules!: unknown;
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: CourseEntity): AuthoredCourseResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      instructor: entity.instructor?.name ?? 'ULearner Instructor',
      description: entity.description,
      price: entity.price,
      category: entity.category,
      imageUrl: entity.imageUrl,
      isPublished: true,
      modules: entity.editorModules ?? [],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
