import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class CreateMenuItemDto {
  @ApiProperty({
    example: 'Butter Chicken',
    description: 'Unique name of the menu item',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Rich and creamy chicken curry cooked with butter and spices.',
    description: 'Optional description of the menu item',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 350.0,
    description: 'Price of the menu item in Rupees',
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Availability status of the menu item',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
