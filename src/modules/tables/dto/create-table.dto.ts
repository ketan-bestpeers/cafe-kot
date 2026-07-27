import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
} from 'class-validator';
import { TableStatus } from '../entities/table.entity';

export class CreateTableDto {
  @ApiProperty({
    example: 'Table 1',
    description: 'Unique identifier or number of the dining table',
  })
  @IsNotEmpty()
  @IsString()
  number: string;

  @ApiProperty({
    example: 4,
    description: 'Seating capacity of the dining table',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({
    example: TableStatus.AVAILABLE,
    description: 'Current status of the table',
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({
    example: 'Indoor',
    description: 'Section or location where the table is placed',
  })
  @IsOptional()
  @IsString()
  section?: string;
}
