import { ApiProperty } from '@nestjs/swagger';
import { MenuItemResponseDto } from './menu-item-response.dto';

class PaginationMetaDto {
  @ApiProperty({
    example: 45,
    description: 'Total number of items matching filters',
  })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages: number;
}

export class PaginatedMenuItemsDto {
  @ApiProperty({
    type: [MenuItemResponseDto],
    description: 'List of menu items',
  })
  data: MenuItemResponseDto[];

  @ApiProperty({ type: PaginationMetaDto, description: 'Pagination metadata' })
  meta: PaginationMetaDto;
}
