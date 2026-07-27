import { ApiProperty } from '@nestjs/swagger';
import { TicketResponseDto } from './ticket-response.dto';

class PaginationMetaDto {
  @ApiProperty({
    example: 25,
    description: 'Total number of tickets matching filters',
  })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of tickets per page' })
  limit: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedTicketsDto {
  @ApiProperty({
    type: [TicketResponseDto],
    description: 'List of KOT tickets',
  })
  data: TicketResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta: PaginationMetaDto;
}
