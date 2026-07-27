import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { DiscountType } from '../entities/coupon.entity';

export class CreateCouponDto {
  @ApiProperty({
    example: 'SAVE20',
    description: 'Unique discount coupon code',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  code: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Type of discount (FLAT or PERCENTAGE)',
  })
  @IsNotEmpty()
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    example: 15.0,
    description: 'Value of the discount',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiry date/time of the coupon',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the coupon is active',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
