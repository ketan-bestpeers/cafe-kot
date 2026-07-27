import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TicketStatus } from '../entities/ticket.entity';

export class UpdateTicketStatusDto {
  @ApiProperty({
    example: TicketStatus.PREPARING,
    description: 'The target status for the ticket transition',
    enum: TicketStatus,
  })
  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: TicketStatus;

  @ApiPropertyOptional({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Optionally assign/reassign a specific Chef by user ID (UUID)',
  })
  @IsOptional()
  @IsUUID()
  chefId?: string;
}
