import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CourseEntity } from '../../courses/entities/course.entity';

@Entity({ name: 'instructors' })
export class InstructorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 180, unique: true })
  email!: string;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Column({ length: 120 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ name: 'twitter_handle', length: 80, nullable: true })
  twitter?: string;

  @Column({ name: 'linkedin_handle', length: 80, nullable: true })
  linkedin?: string;

  @OneToMany(() => CourseEntity, (course) => course.instructor)
  courses!: CourseEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
