import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  CORS_ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  JWT_SECRET: Joi.string().min(16).default('ultra-secret-key'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(16).default('ultra-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  MEDIA_BASE_URL: Joi.string().uri().default('http://localhost:3001'),
  MEDIA_UPLOAD_DIR: Joi.string().default('uploads/media'),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().default('ulearner'),
  POSTGRES_USER: Joi.string().default('potgress'),
  POSTGRES_PASSWORD: Joi.string().default('29082006'),
  DATABASE_LOGGING: Joi.boolean().default(false),
});
