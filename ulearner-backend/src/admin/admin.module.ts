import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminModule as AdminJSSupportModule } from '@adminjs/nestjs';
import AdminJS, { ComponentLoader } from 'adminjs';
import * as AdminJSTypeOrm from '@adminjs/typeorm';
import { DATA_TYPES } from '@adminjs/typeorm/lib/utils/data-types';
import path from 'node:path';
import { buildAdminResources } from './resources';
import { adminSessionStore } from './session-store';

DATA_TYPES['simple-array'] = 'mixed';

AdminJS.registerAdapter({
  Database: AdminJSTypeOrm.Database,
  Resource: AdminJSTypeOrm.Resource,
});

const componentLoader = new ComponentLoader();
const adminComponents = {
  imagePreview: componentLoader.add('ImagePreview', path.join(__dirname, 'components', 'ImagePreview')),
  videoPreview: componentLoader.add('VideoPreview', path.join(__dirname, 'components', 'VideoPreview')),
  imageUploadEdit: componentLoader.add('ImageUploadEdit', path.join(__dirname, 'components', 'ImageUploadEdit')),
  dashboard: componentLoader.add('AdminDashboard', path.join(__dirname, 'components', 'Dashboard')),
};

@Module({
  imports: [
    AdminJSSupportModule.createAdminAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const rootPath = '/admin';
        const companyName = configService.get<string>('app.env') === 'production' ? 'ULearner' : 'ULearner (Dev)';
        const cookieSecret = configService.getOrThrow<string>('admin.cookieSecret');
        const cookieName = configService.getOrThrow<string>('admin.cookieName');
        const adminEmail = configService.getOrThrow<string>('admin.email');
        const adminPassword = configService.getOrThrow<string>('admin.password');

        return {
          adminJsOptions: {
            rootPath,
            componentLoader,
            resources: buildAdminResources(adminComponents),
            dashboard: {
              component: adminComponents.dashboard,
            },
            branding: {
              companyName,
              softwareBrothers: false,
            },
          },
          auth: {
            authenticate: async (email: string, password: string) => {
              if (email === adminEmail && password === adminPassword) {
                return { email };
              }
              return null;
            },
            cookieName,
            cookiePassword: cookieSecret,
          },
          sessionOptions: {
            resave: false,
            saveUninitialized: false,
            secret: cookieSecret,
            store: adminSessionStore,
            name: cookieName,
          },
        };
      },
    }),
  ],
})
export class AdminUiModule {}
