import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateMenuItemDto {
  @ApiPropertyOptional({
    example: 'Butter Chicken',
    description: 'Updated name of the menu item',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'Rich and creamy chicken curry cooked with butter and spices.',
    description: 'Updated description of the menu item',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 350.0,
    description: 'Updated price of the menu item in Rupees',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Updated availability status of the menu item',
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
