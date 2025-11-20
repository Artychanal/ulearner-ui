import { CourseReviewEntity } from '../entities/course-review.entity';

export class CourseReviewResponseDto {
  id!: string;
  rating!: number;
  comment?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
  author!: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };

  static fromEntity(entity: CourseReviewEntity): CourseReviewResponseDto {
    return {
      id: entity.id,
      rating: entity.rating,
      comment: entity.comment,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      author: {
        id: entity.author.id,
        name: entity.author.name,
        avatarUrl: entity.author.avatarUrl,
      },
    };
  }
}

export class CourseReviewSummaryDto {
  averageRating!: number;
  totalReviews!: number;
  reviews!: CourseReviewResponseDto[];
}
