import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLessonVideoMedia1700000000006 implements MigrationInterface {
  name = 'AddLessonVideoMedia1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "video_media_id" uuid');
    await queryRunner.query(
      'ALTER TABLE "lessons" ADD CONSTRAINT "FK_lessons_video_media" FOREIGN KEY ("video_media_id") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "lessons" DROP CONSTRAINT IF EXISTS "FK_lessons_video_media"');
    await queryRunner.query('ALTER TABLE "lessons" DROP COLUMN IF EXISTS "video_media_id"');
  }
}
