import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersAuthTables1700000000002 implements MigrationInterface {
  name = 'AddUsersAuthTables1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(120) NOT NULL,
        "email" varchar(180) NOT NULL UNIQUE,
        "password_hash" varchar NOT NULL,
        "avatar_url" varchar NULL,
        "bio" text NULL,
        "roles" varchar NOT NULL DEFAULT 'student',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "enrollments" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "progress" int NOT NULL DEFAULT 0,
        "completed_lessons" jsonb NOT NULL DEFAULT '[]',
        "quiz_attempts" jsonb NOT NULL DEFAULT '[]',
        "last_accessed" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "origin" varchar(40) NOT NULL DEFAULT 'catalog',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT enrollments_unique UNIQUE ("user_id", "course_id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
        "origin" varchar(40) NOT NULL DEFAULT 'catalog',
        "added_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT favorites_unique UNIQUE ("user_id", "course_id", "origin")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token" varchar NOT NULL UNIQUE,
        "expires_at" TIMESTAMPTZ NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "refresh_tokens";');
    await queryRunner.query('DROP TABLE IF EXISTS "favorites";');
    await queryRunner.query('DROP TABLE IF EXISTS "enrollments";');
    await queryRunner.query('DROP TABLE IF EXISTS "users";');
  }
}
