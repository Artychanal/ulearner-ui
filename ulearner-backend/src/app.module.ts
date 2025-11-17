import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { CoursesModule } from './courses/courses.module';
import { InstructorsModule } from './instructors/instructors.module';
import { TestimonialsModule } from './testimonials/testimonials.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { FavoritesModule } from './favorites/favorites.module';
import { MediaModule } from './media/media.module';
import { AuthoredCoursesModule } from './authored-courses/authored-courses.module';
import { CertificatesModule } from './certificates/certificates.module';
import { CourseReviewsModule } from './course-reviews/course-reviews.module';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AdminUiModule } from './admin/admin.module';
import { AdminApiModule } from './admin/admin-api.module';
import { AdminMediaController } from './admin/admin-media.controller';
import session from 'express-session';
import { adminSessionStore } from './admin/session-store';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        logging: configService.get<boolean>('database.logging'),
        migrations: ['dist/database/migrations/*.js'],
      }),
    }),
    InstructorsModule,
    CoursesModule,
    TestimonialsModule,
    UsersModule,
    AuthModule,
    EnrollmentsModule,
    FavoritesModule,
    MediaModule,
    AuthoredCoursesModule,
    CertificatesModule,
    CourseReviewsModule,
    AdminUiModule,
    AdminApiModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const cookieSecret = this.configService.get<string>('admin.cookieSecret') ?? 'admin-session-secret';
    const cookieName = this.configService.get<string>('admin.cookieName') ?? 'adminjs';

    consumer.apply(
      session({
        store: adminSessionStore,
        resave: false,
        saveUninitialized: false,
        secret: cookieSecret,
        name: cookieName,
      }),
    ).forRoutes(AdminMediaController);

    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
