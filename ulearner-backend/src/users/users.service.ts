import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email: email.toLowerCase() } });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} was not found`);
    }
    return user;
  }

  async create(dto: CreateUserDto, passwordHash: string) {
    const entity = this.userRepository.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      passwordHash,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      roles: ['student'],
    });
    return this.userRepository.save(entity);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, {
      name: dto.name ?? user.name,
      email: dto.email ? dto.email.toLowerCase() : user.email,
      avatarUrl: dto.avatarUrl ?? user.avatarUrl,
      bio: dto.bio ?? user.bio,
    });
    return this.userRepository.save(user);
  }
}
