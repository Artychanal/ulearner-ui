const configuration = () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
    corsOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  database: {
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: parseInt(process.env.POSTGRES_PORT ?? '5432', 10),
    name: process.env.POSTGRES_DB ?? 'ulearner',
    user: process.env.POSTGRES_USER ?? 'potgress',
    password: process.env.POSTGRES_PASSWORD ?? '29082006',
    logging: (process.env.DATABASE_LOGGING ?? 'false') === 'true',
  },
});

export default configuration;
