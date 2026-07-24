import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  MinLength,
  IsBoolean,
} from 'class-validator';
import { Role } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'chef@cafekot.com',
    description: 'Updated email address',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewStrongPassword123!',
    description: 'Updated password, minimum 6 characters',
    minLength: 6,
  })
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({
    example: 'Johnathan Doe',
    description: 'Updated full name',
  })
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.MANAGER,
    description: 'Updated role',
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    example: true,
    description: 'Toggle user activation state',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
