import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the user (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'chef@cafekot.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  fullName: string;

  @ApiProperty({
    enum: Role,
    example: Role.CHEF,
    description: 'Assigned role for the user',
  })
  role: Role;

  @ApiProperty({
    example: true,
    description: 'Status indicating whether user account is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2026-07-24T12:00:00.000Z',
    description: 'Timestamp when user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-24T12:00:00.000Z',
    description: 'Timestamp when user was last updated',
  })
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    if (!user) return null;
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.fullName = user.fullName;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  static fromEntities(users: User[]): UserResponseDto[] {
    return (users || []).map((user) => UserResponseDto.fromEntity(user));
  }
}
