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

@Entity({ name: 'testimonials' })
export class TestimonialEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'statement', type: 'text' })
  statement!: string;

  @Column({ name: 'user_name', length: 120 })
  userName!: string;

  @Column({ name: 'user_email', length: 180 })
  userEmail!: string;

  @Column({ name: 'user_avatar', nullable: true })
  userAvatar?: string;

  @ManyToOne(() => CourseEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'course_id' })
  course?: CourseEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
