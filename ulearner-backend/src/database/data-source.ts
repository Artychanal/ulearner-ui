import 'dotenv/config';
import { DataSource } from 'typeorm';
import configuration from '../config/configuration';
import { CourseEntity } from '../courses/entities/course.entity';
import { LessonEntity } from '../lessons/entities/lesson.entity';
import { InstructorEntity } from '../instructors/entities/instructor.entity';
import { TestimonialEntity } from '../testimonials/entities/testimonial.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EnrollmentEntity } from '../enrollments/entities/enrollment.entity';
import { FavoriteEntity } from '../favorites/entities/favorite.entity';
import { RefreshTokenEntity } from '../auth/entities/refresh-token.entity';
import { MediaEntity } from '../media/entities/media.entity';
import { CreateCoreTables1700000000001 } from './migrations/1700000000001-CreateCoreTables';
import { AddUsersAuthTables1700000000002 } from './migrations/1700000000002-AddUsersAuthTables';
import { CreateMediaTable1700000000003 } from './migrations/1700000000003-CreateMediaTable';
import { AddMediaStoragePath1700000000004 } from './migrations/1700000000004-AddMediaStoragePath';
import { AddCourseOwnerAndEditorModules1700000000005 } from './migrations/1700000000005-AddCourseOwnerAndEditorModules';

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
  entities: [
    CourseEntity,
    LessonEntity,
    InstructorEntity,
    TestimonialEntity,
    UserEntity,
    EnrollmentEntity,
    FavoriteEntity,
    RefreshTokenEntity,
    MediaEntity,
  ],
  migrations: [
    CreateCoreTables1700000000001,
    AddUsersAuthTables1700000000002,
    CreateMediaTable1700000000003,
    AddMediaStoragePath1700000000004,
    AddCourseOwnerAndEditorModules1700000000005,
  ],
});

export default AppDataSource;
