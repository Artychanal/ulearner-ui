import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EnrollmentEntity } from '../../enrollments/entities/enrollment.entity';
import { FavoriteEntity } from '../../favorites/entities/favorite.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 180, unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column('simple-array', { default: 'student' })
  roles!: string[];

  @OneToMany(() => EnrollmentEntity, (enrollment) => enrollment.user)
  enrollments!: EnrollmentEntity[];

  @OneToMany(() => FavoriteEntity, (favorite) => favorite.user)
  favorites!: FavoriteEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
