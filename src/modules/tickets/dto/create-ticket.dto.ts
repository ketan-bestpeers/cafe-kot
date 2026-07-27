import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsUUID,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTicketItemDto {
  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Unique identifier of the menu item (UUID)',
  })
  @IsNotEmpty()
  @IsUUID()
  menuItemId: string;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the item ordered',
    minimum: 1,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    example: 'Extra spicy, no onions',
    description: 'Any special chef instructions or customer preferences',
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateTicketDto {
  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the active dining session order (UUID)',
  })
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @ApiProperty({
    type: [CreateTicketItemDto],
    description: 'List of menu items to order in this KOT ticket',
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTicketItemDto)
  items: CreateTicketItemDto[];
}
