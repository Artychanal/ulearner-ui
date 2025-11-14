import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity({ name: 'enrollments' })
export class EnrollmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => UserEntity, (user) => user.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => CourseEntity, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @Column({ type: 'int', default: 0 })
  progress!: number;

  @Column({ name: 'completed_lessons', type: 'jsonb', default: () => "'[]'" })
  completedLessons!: string[];

  @Column({ name: 'quiz_attempts', type: 'jsonb', default: () => "'[]'" })
  quizAttempts!: unknown[];

  @Column({ name: 'last_accessed', type: 'timestamptz', default: () => 'now()' })
  lastAccessed!: Date;

  @Column({ length: 40, default: 'catalog' })
  origin!: 'catalog' | 'authored';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
