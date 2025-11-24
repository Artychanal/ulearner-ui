import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { CertificateEntity } from './entities/certificate.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import PDFDocument from 'pdfkit';

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
    private readonly configService: ConfigService,
  ) {}

  async issueForEnrollment(enrollment: EnrollmentEntity) {
    if (enrollment.progress < 100) {
      return null;
    }
    const instructorName = this.resolveInstructorName(enrollment);

    if (enrollment.certificate) {
      await this.ensureInstructorName(enrollment.certificate, instructorName);
      return enrollment.certificate;
    }

    const courseTitle = enrollment.course.title;
    const recipientName = enrollment.user.name;
    const courseDurationMinutes = this.calculateCourseDurationMinutes(enrollment);
    const platformSignature =
      this.configService.get<string>('certificates.signature') ??
      'Certified by ULearner — Learn. Build. Grow.';

    const certificate = this.certificateRepository.create({
      certificateNumber: await this.generateUniqueNumber(),
      enrollment,
      courseTitle,
      instructorName,
      recipientName,
      courseDurationMinutes,
      platformSignature,
    });

    const saved = await this.certificateRepository.save(certificate);
    enrollment.certificate = saved;
    return saved;
  }

  async verify(certificateNumber: string) {
    const certificate = await this.certificateRepository.findOne({
      where: { certificateNumber },
      relations: [
        'enrollment',
        'enrollment.course',
        'enrollment.course.owner',
        'enrollment.course.instructor',
      ],
    });
    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }
    const instructorName = this.resolveInstructorName(certificate.enrollment);
    await this.ensureInstructorName(certificate, instructorName);
    return certificate;
  }

  generatePdf(certificate: CertificateEntity) {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(26)
        .text('Certificate of Completion', { align: 'center', underline: true })
        .moveDown(1.5);

      doc
        .fontSize(14)
        .fillColor('#666')
        .text('This certifies that', { align: 'center' })
        .moveDown(0.5);

      doc.fontSize(24).fillColor('#111').text(certificate.recipientName, { align: 'center' }).moveDown(1);

      doc
        .fontSize(14)
        .fillColor('#333')
        .text(
          `has successfully completed the "${certificate.courseTitle}" course instructed by ${certificate.instructorName}.`,
          {
            align: 'center',
          },
        )
        .moveDown(1);

      const hours = (certificate.courseDurationMinutes / 60).toFixed(1);
      doc
        .fontSize(12)
        .fillColor('#555')
        .text(`Approximate study time: ${hours.replace(/\\.0$/, '')} hours`, { align: 'center' })
        .moveDown(2);

      const issued = new Date(certificate.issuedAt);
      doc
        .fontSize(11)
        .text(`Issued on: ${issued.toLocaleDateString()}`, { align: 'left' })
        .moveDown(0.5);
      doc
        .text(`Certificate Number: ${certificate.certificateNumber}`, { align: 'left' })
        .moveDown(1.5);

      doc
        .fontSize(12)
        .fillColor('#000')
        .text(certificate.platformSignature, {
          align: 'center',
        });

      doc.end();
    });
  }

  private async ensureInstructorName(certificate: CertificateEntity, resolvedName: string) {
    if (certificate.instructorName === resolvedName) {
      return;
    }
    certificate.instructorName = resolvedName;
    await this.certificateRepository.save(certificate);
  }

  private calculateCourseDurationMinutes(enrollment: EnrollmentEntity) {
    const lessons = enrollment.course.lessons ?? [];
    const totalMinutes = lessons.reduce((acc, lesson) => acc + (lesson.durationMinutes ?? 0), 0);
    return totalMinutes || 60;
  }

  private resolveInstructorName(enrollment: EnrollmentEntity) {
    const ownerName = enrollment.course.owner?.name?.trim();
    if (ownerName && ownerName.toLowerCase() !== 'you') {
      return ownerName;
    }
    const instructorName = enrollment.course.instructor?.name?.trim();
    if (instructorName && instructorName.toLowerCase() !== 'you') {
      return instructorName;
    }
    return 'ULearner Mentor';
  }

  private async generateUniqueNumber() {
    const prefix = 'UL';
    const attempt = () => {
      const date = new Date();
      const datePart = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date
        .getDate()
        .toString()
        .padStart(2, '0')}`;
      const randomPart = randomUUID().split('-')[0].toUpperCase();
      return `${prefix}-${datePart}-${randomPart}`;
    };

    for (let i = 0; i < 10; i++) {
      const certificateNumber = attempt();
      const existing = await this.certificateRepository.findOne({
        where: { certificateNumber },
      });
      if (!existing) {
        return certificateNumber;
      }
    }
    throw new InternalServerErrorException('Could not generate unique certificate number');
  }
}
