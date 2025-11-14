import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity({ name: 'favorites' })
@Unique('favorites_unique_constraint', ['user', 'course', 'origin'])
export class FavoriteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => CourseEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ length: 40, default: 'catalog' })
  origin!: 'catalog' | 'authored';

  @CreateDateColumn({ name: 'added_at' })
  addedAt!: Date;
}
