export default () => ({
  app: {
    port: parseInt(process.env.PORT ?? '3001', 10) || 3001,
    nodeEnv: process.env.NODE_ENV,
    wsPath: process.env.WS_PATH ?? '/ws',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',').map(s => s.trim()) ?? [],
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN,
  },
})
