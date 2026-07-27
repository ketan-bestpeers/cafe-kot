import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsIn,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TableStatus } from '../entities/table.entity';

export class TableQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of tables per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search query for table number (case-insensitive)',
    example: 'Table',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter tables by status',
    enum: TableStatus,
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({
    description: 'Filter tables by section/location',
    example: 'Indoor',
  })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({
    description: 'Filter tables by minimum seating capacity',
    example: 4,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minCapacity?: number;

  @ApiPropertyOptional({
    description: 'Field to sort tables by',
    default: 'number',
    enum: ['number', 'capacity', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['number', 'capacity', 'createdAt'])
  sortBy?: string = 'number';

  @ApiPropertyOptional({
    description: 'Sorting order',
    default: 'ASC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
