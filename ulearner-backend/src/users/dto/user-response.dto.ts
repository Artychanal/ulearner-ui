import { UserEntity } from '../entities/user.entity';

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  avatarUrl?: string;
  bio?: string;
  roles!: string[];
  createdAt!: Date;
  updatedAt!: Date;

  static fromEntity(entity: UserEntity): UserResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      avatarUrl: entity.avatarUrl,
      bio: entity.bio,
      roles: Array.isArray(entity.roles)
        ? entity.roles
        : String(entity.roles ?? 'student')
            .split(',')
            .map((role) => role.trim())
            .filter(Boolean),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
