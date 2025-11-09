import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity({ name: 'lessons' })
export class LessonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 180 })
  title!: string;

  @Column({ name: 'duration_minutes', type: 'int', default: 10 })
  durationMinutes!: number;

  @Column({ type: 'int', default: 1 })
  position!: number;

  @ManyToOne(() => CourseEntity, (course) => course.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: CourseEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
