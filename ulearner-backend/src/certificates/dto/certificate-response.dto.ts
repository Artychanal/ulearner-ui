import { CertificateEntity } from '../entities/certificate.entity';

export class CertificateResponseDto {
  id!: string;
  certificateNumber!: string;
  courseTitle!: string;
  instructorName!: string;
  recipientName!: string;
  courseDurationMinutes!: number;
  platformSignature!: string;
  issuedAt!: Date;

  static fromEntity(entity: CertificateEntity): CertificateResponseDto {
    return {
      id: entity.id,
      certificateNumber: entity.certificateNumber,
      courseTitle: entity.courseTitle,
      instructorName: entity.instructorName,
      recipientName: entity.recipientName,
      courseDurationMinutes: entity.courseDurationMinutes,
      platformSignature: entity.platformSignature,
      issuedAt: entity.issuedAt,
    };
  }
}
