import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCourseOwnerAndEditorModules1700000000005 implements MigrationInterface {
  name = 'AddCourseOwnerAndEditorModules1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "owner_id" uuid NULL REFERENCES "users"("id") ON DELETE SET NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "editor_modules" jsonb NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "is_published" boolean NOT NULL DEFAULT true;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "courses" DROP COLUMN IF EXISTS "editor_modules";');
    await queryRunner.query('ALTER TABLE "courses" DROP COLUMN IF EXISTS "is_published";');
    await queryRunner.query('ALTER TABLE "courses" DROP COLUMN IF EXISTS "owner_id";');
  }
}
