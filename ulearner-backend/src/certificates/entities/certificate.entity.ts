import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';

@Entity({ name: 'certificates' })
export class CertificateEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'certificate_number', length: 64, unique: true })
  certificateNumber!: string;

  @OneToOne(() => EnrollmentEntity, (enrollment) => enrollment.certificate, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'enrollment_id' })
  enrollment!: EnrollmentEntity;

  @Column({ name: 'course_title', length: 255 })
  courseTitle!: string;

  @Column({ name: 'instructor_name', length: 255 })
  instructorName!: string;

  @Column({ name: 'recipient_name', length: 255 })
  recipientName!: string;

  @Column({ name: 'course_duration_minutes', type: 'int' })
  courseDurationMinutes!: number;

  @Column({ name: 'platform_signature', length: 255 })
  platformSignature!: string;

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt!: Date;
}
