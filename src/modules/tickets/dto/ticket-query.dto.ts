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
import { TicketStatus } from '../entities/ticket.entity';

export class TicketQueryDto {
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
    description: 'Number of tickets per page',
    default: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter tickets by status',
    enum: TicketStatus,
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiPropertyOptional({
    description: 'Filter tickets by Order ID (UUID)',
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    description: 'Filter tickets by Waiter ID (UUID)',
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
  })
  @IsOptional()
  @IsUUID()
  assignedWaiterId?: string;

  @ApiPropertyOptional({
    description: 'Filter tickets by Chef ID (UUID)',
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
  })
  @IsOptional()
  @IsUUID()
  assignedChefId?: string;

  @ApiPropertyOptional({
    description: 'Field to sort tickets by',
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
