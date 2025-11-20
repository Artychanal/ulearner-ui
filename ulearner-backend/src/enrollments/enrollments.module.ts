import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnrollmentEntity } from './entities/enrollment.entity';
import { CourseEntity } from '../courses/entities/course.entity';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [TypeOrmModule.forFeature([EnrollmentEntity, CourseEntity]), CertificatesModule],
  controllers: [EnrollmentsController],
  providers: [EnrollmentsService],
  exports: [EnrollmentsService],
})
export class EnrollmentsModule {}
