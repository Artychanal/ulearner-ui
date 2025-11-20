const configuration = () => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
    corsOrigins: (process.env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    webUrl: process.env.APP_WEB_URL ?? 'http://localhost:3000',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'ultra-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'ultra-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  media: {
    baseUrl: process.env.MEDIA_BASE_URL ?? `http://localhost:${process.env.PORT ?? '3001'}`,
    uploadDir: process.env.MEDIA_UPLOAD_DIR ?? 'uploads/media',
  },
  certificates: {
    signature:
      process.env.CERTIFICATE_SIGNATURE ??
      'Empowering lifelong learners — Officially certified by ULearner',
  },
  admin: {
    email: process.env.ADMIN_EMAIL ?? 'admin@ulearner.dev',
    password: process.env.ADMIN_PASSWORD ?? 'change-me-now',
    cookieName: process.env.ADMIN_COOKIE_NAME ?? 'ulearner_admin',
    cookieSecret: process.env.ADMIN_COOKIE_SECRET ?? 'super-secret-admin-cookie',
  },
  mail: {
    fromEmail: process.env.MAIL_FROM_EMAIL ?? 'no-reply@ulearner.dev',
    fromName: process.env.MAIL_FROM_NAME ?? 'ULearner',
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
    smtpSecure: (process.env.SMTP_SECURE ?? 'false') === 'true',
    smtpUser: process.env.SMTP_USER,
    smtpPassword: process.env.SMTP_PASSWORD,
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
