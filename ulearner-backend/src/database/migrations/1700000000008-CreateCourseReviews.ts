import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCourseReviews1700000000008 implements MigrationInterface {
  name = 'CreateCourseReviews1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_reviews" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "rating" int NOT NULL,
        "comment" text NULL,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "author_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_course_reviews_course_author" UNIQUE ("course_id", "author_id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "course_reviews";');
  }
}
