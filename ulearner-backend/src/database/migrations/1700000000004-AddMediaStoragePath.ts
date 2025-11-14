import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaStoragePath1700000000004 implements MigrationInterface {
  name = 'AddMediaStoragePath1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "media"
      ADD COLUMN IF NOT EXISTS "storage_path" varchar NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE "media"
      ALTER COLUMN "data" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "media" DROP COLUMN IF EXISTS "storage_path";');
    await queryRunner.query('ALTER TABLE "media" ALTER COLUMN "data" SET NOT NULL;');
  }
}
