import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  CORS_ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().default('ulearner'),
  POSTGRES_USER: Joi.string().default('potgress'),
  POSTGRES_PASSWORD: Joi.string().default('29082006'),
  DATABASE_LOGGING: Joi.boolean().default(false),
});
