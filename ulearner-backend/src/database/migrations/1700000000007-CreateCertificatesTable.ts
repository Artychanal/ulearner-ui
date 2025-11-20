import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCertificatesTable1700000000007 implements MigrationInterface {
  name = 'CreateCertificatesTable1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "certificates" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "certificate_number" varchar(64) UNIQUE NOT NULL,
        "course_title" varchar(255) NOT NULL,
        "instructor_name" varchar(255) NOT NULL,
        "recipient_name" varchar(255) NOT NULL,
        "course_duration_minutes" int NOT NULL,
        "platform_signature" varchar(255) NOT NULL,
        "issued_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "enrollment_id" uuid UNIQUE NOT NULL REFERENCES "enrollments"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "certificates";');
  }
}
