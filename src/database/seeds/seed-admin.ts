import * as crypto from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto as any;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../modules/users/users.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../modules/users/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const configService = app.get(ConfigService);

  const email = configService.get<string>('app.seedAdmin.email');
  const password = configService.get<string>('app.seedAdmin.password');

  console.log(`Seeding Admin user: ${email}...`);

  try {
    const existing = await usersService.findByEmail(email);
    if (existing) {
      console.log(`Admin user with email ${email} already exists.`);
    } else {
      // The UsersService.create checks creator's role hierarchy.
      // Since this is a CLI script, we mock an ADMIN creator to bypass checks.
      const mockCreator = { role: Role.ADMIN } as any;
      await usersService.create(
        {
          email,
          password,
          fullName: 'Super Administrator',
          role: Role.ADMIN,
        },
        mockCreator,
      );
      console.log('Admin user successfully seeded.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
