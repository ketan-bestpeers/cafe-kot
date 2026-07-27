import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TableStatus } from '../entities/table.entity';

export class UpdateTableStatusDto {
  @ApiProperty({
    example: TableStatus.OCCUPIED,
    description: 'The status to set for the table',
    enum: TableStatus,
  })
  @IsNotEmpty()
  @IsEnum(TableStatus)
  status: TableStatus;
}
