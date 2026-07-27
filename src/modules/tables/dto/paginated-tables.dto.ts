import { ApiProperty } from '@nestjs/swagger';
import { TableResponseDto } from './table-response.dto';

class PaginationMetaDto {
  @ApiProperty({
    example: 25,
    description: 'Total number of tables matching filters',
  })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of tables per page' })
  limit: number;

  @ApiProperty({ example: 3, description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedTablesDto {
  @ApiProperty({
    type: [TableResponseDto],
    description: 'List of tables',
  })
  data: TableResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta: PaginationMetaDto;
}
