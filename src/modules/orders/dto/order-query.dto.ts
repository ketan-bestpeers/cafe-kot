import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsIn,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

export class OrderQueryDto {
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
    description: 'Number of orders per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter orders by status',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filter orders by Table ID (UUID)',
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
  })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiPropertyOptional({
    description: 'Field to sort orders by',
    default: 'createdAt',
    enum: ['createdAt', 'status'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'status'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sorting order',
    default: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
