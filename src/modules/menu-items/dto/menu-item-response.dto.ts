import { ApiProperty } from '@nestjs/swagger';
import { MenuItem } from '../entities/menu-item.entity';

export class MenuItemResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the menu item (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Butter Chicken',
    description: 'Unique name of the menu item',
  })
  name: string;

  @ApiProperty({
    example: 'Rich and creamy chicken curry cooked with butter and spices.',
    description: 'Description of the menu item',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    example: 350.0,
    description: 'Price of the menu item in Rupees',
  })
  price: number;

  @ApiProperty({
    example: true,
    description: 'Status indicating whether the menu item is available',
  })
  isAvailable: boolean;

  @ApiProperty({
    example: '2026-07-24T12:00:00.000Z',
    description: 'Timestamp when the menu item was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-24T12:00:00.000Z',
    description: 'Timestamp when the menu item was last updated',
  })
  updatedAt: Date;

  static fromEntity(item: MenuItem): MenuItemResponseDto {
    if (!item) return null;
    const dto = new MenuItemResponseDto();
    dto.id = item.id;
    dto.name = item.name;
    dto.description = item.description;
    dto.price = item.price;
    dto.isAvailable = item.isAvailable;
    dto.createdAt = item.createdAt;
    dto.updatedAt = item.updatedAt;
    return dto;
  }

  static fromEntities(items: MenuItem[]): MenuItemResponseDto[] {
    return (items || []).map((item) => MenuItemResponseDto.fromEntity(item));
  }
}
