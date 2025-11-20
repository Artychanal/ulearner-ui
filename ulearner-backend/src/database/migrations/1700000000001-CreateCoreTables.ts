import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoreTables1700000000001 implements MigrationInterface {
  name = 'CreateCoreTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "instructors" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(120) NOT NULL,
        "email" varchar(180) UNIQUE NOT NULL,
        "avatar_url" varchar NULL,
        "title" varchar(120) NOT NULL,
        "bio" text NULL,
        "twitter_handle" varchar(80) NULL,
        "linkedin_handle" varchar(80) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "courses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(200) UNIQUE NOT NULL,
        "description" text NOT NULL,
        "price" numeric(8,2) NOT NULL,
        "category" varchar(120) NOT NULL,
        "image_url" varchar NULL,
        "instructor_id" uuid NOT NULL REFERENCES "instructors"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lessons" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "title" varchar(180) NOT NULL,
        "duration_minutes" int NOT NULL DEFAULT 10,
        "position" int NOT NULL DEFAULT 1,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "testimonials" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "statement" text NOT NULL,
        "user_name" varchar(120) NOT NULL,
        "user_email" varchar(180) NOT NULL,
        "user_avatar" varchar NULL,
        "course_id" uuid NULL REFERENCES "courses"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "testimonials";');
    await queryRunner.query('DROP TABLE IF EXISTS "lessons";');
    await queryRunner.query('DROP TABLE IF EXISTS "courses";');
    await queryRunner.query('DROP TABLE IF EXISTS "instructors";');
  }
}
