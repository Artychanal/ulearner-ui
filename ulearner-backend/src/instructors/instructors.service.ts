import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';
import { InstructorEntity } from './entities/instructor.entity';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectRepository(InstructorEntity)
    private readonly instructorRepository: Repository<InstructorEntity>,
  ) {}

  findAll() {
    return this.instructorRepository.find({
      relations: {
        courses: true,
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const instructor = await this.instructorRepository.findOne({
      where: { id },
      relations: {
        courses: true,
      },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor ${id} was not found`);
    }

    return instructor;
  }

  async create(dto: CreateInstructorDto) {
    const entity = this.instructorRepository.create(dto);
    return this.instructorRepository.save(entity);
  }

  async update(id: string, dto: UpdateInstructorDto) {
    const existing = await this.instructorRepository.preload({
      id,
      ...dto,
    });

    if (!existing) {
      throw new NotFoundException(`Instructor ${id} was not found`);
    }

    return this.instructorRepository.save(existing);
  }

  async remove(id: string) {
    const instructor = await this.findOne(id);
    await this.instructorRepository.remove(instructor);
    return { id };
  }
}
