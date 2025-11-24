import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModerationFields1700000000011 implements MigrationInterface {
  name = 'AddModerationFields1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" varchar(32) NOT NULL DEFAULT 'active'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "status"`);
  }
}
