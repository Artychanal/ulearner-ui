import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteEntity } from './entities/favorite.entity';
import { ToggleFavoriteDto } from './dto/create-favorite.dto';
import { CourseEntity } from '../courses/entities/course.entity';
import { UserEntity } from '../users/entities/user.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteEntity)
    private readonly favoriteRepository: Repository<FavoriteEntity>,
    @InjectRepository(CourseEntity)
    private readonly courseRepository: Repository<CourseEntity>,
  ) {}

  list(userId: string) {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['course'],
      order: { addedAt: 'DESC' },
    });
  }

  async toggle(userId: string, dto: ToggleFavoriteDto) {
    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, course: { id: dto.courseId }, origin: dto.origin },
    });

    if (existing) {
      await this.favoriteRepository.remove(existing);
      return { removed: true };
    }

    const course = await this.courseRepository.findOne({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const favorite = this.favoriteRepository.create({
      user: { id: userId } as UserEntity,
      course,
      origin: dto.origin,
    });
    await this.favoriteRepository.save(favorite);
    return { removed: false, favorite };
  }
}
