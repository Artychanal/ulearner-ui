import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorEntity } from './entities/instructor.entity';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorEntity])],
  controllers: [InstructorsController],
  providers: [InstructorsService],
  exports: [InstructorsService, TypeOrmModule],
})
export class InstructorsModule {}
