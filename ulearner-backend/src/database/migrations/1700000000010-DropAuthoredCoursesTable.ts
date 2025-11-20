import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropAuthoredCoursesTable1700000000010 implements MigrationInterface {
  name = 'DropAuthoredCoursesTable1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "authored_courses";');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "authored_courses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "owner_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "title" varchar(200) NOT NULL,
        "instructor_name" varchar(180) NOT NULL,
        "description" text NOT NULL,
        "price" numeric(8,2) NOT NULL DEFAULT 0,
        "category" varchar(120) NOT NULL,
        "image_url" varchar NULL,
        "is_published" boolean NOT NULL DEFAULT false,
        "editor_modules" jsonb NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
}
