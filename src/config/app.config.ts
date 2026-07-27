import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  gstRate: parseFloat(process.env.GST_RATE) || 5.0,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'cafe_kot',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET || 'super_secret_jwt_key_change_me_in_production',
    expiration: process.env.JWT_EXPIRATION || '24h',
  },
  seedAdmin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@cafekot.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'AdminSecurePassword123!',
  },
}));
