import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMediaTable1700000000003 implements MigrationInterface {
  name = 'CreateMediaTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "media" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "filename" varchar(255) NOT NULL,
        "mime_type" varchar(120) NOT NULL,
        "size" int NOT NULL,
        "data" bytea NOT NULL,
        "uploader_id" uuid NULL REFERENCES "users"("id") ON DELETE SET NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_url" varchar NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "lessons" DROP COLUMN IF EXISTS "video_url";');
    await queryRunner.query('DROP TABLE IF EXISTS "media";');
  }
}
