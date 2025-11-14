import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { InstructorEntity } from '../../instructors/entities/instructor.entity';
import { LessonEntity } from '../../lessons/entities/lesson.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'courses' })
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value ? parseFloat(value) : 0),
    },
  })
  price!: number;

  @Column({ length: 120 })
  category!: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @Column({ name: 'is_published', default: true })
  isPublished!: boolean;

  @ManyToOne(() => InstructorEntity, (instructor) => instructor.courses, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'instructor_id' })
  instructor!: InstructorEntity;

  @OneToMany(() => LessonEntity, (lesson) => lesson.course, {
    cascade: true,
    eager: true,
  })
  lessons!: LessonEntity[];

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner?: UserEntity;

  @Column({ name: 'editor_modules', type: 'jsonb', nullable: true })
  editorModules?: unknown;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
