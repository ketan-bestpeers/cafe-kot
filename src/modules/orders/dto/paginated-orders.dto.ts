import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from './order-response.dto';

class PaginationMetaDto {
  @ApiProperty({
    example: 25,
    description: 'Total number of orders matching filters',
  })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of orders per page' })
  limit: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedOrdersDto {
  @ApiProperty({
    type: [OrderResponseDto],
    description: 'List of orders',
  })
  data: OrderResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta: PaginationMetaDto;
}
