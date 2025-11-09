import 'dotenv/config';
import { DataSource } from 'typeorm';
import configuration from '../config/configuration';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { TestimonialEntity } from '../testimonials/entities/testimonial.entity';
import { CreateCoreTables1700000000001 } from './migrations/1700000000001-CreateCoreTables';

const config = configuration();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.name,
  synchronize: false,
  logging: config.database.logging,
  entities: [CourseEntity, LessonEntity, InstructorEntity, TestimonialEntity],
  migrations: [CreateCoreTables1700000000001],
});

export default AppDataSource;
