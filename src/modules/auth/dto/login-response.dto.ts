import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description:
      'Signed JSON Web Token (JWT) to include as Bearer token in auth headers',
  })
  accessToken: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Profile details of the authenticated user',
  })
  user: UserResponseDto;
}
