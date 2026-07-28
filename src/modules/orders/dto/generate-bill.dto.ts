import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class GenerateBillDto {
  @ApiPropertyOptional({
    example: 'SAVE20',
    description: 'Coupon code to apply to the order bill',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toUpperCase())
  couponCode?: string;

  @ApiPropertyOptional({
    example: 'percent',
    description: 'Custom discount type to apply (percent or flat)',
    enum: ['percent', 'flat'],
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsEnum(['percent', 'flat'], {
    message: 'discountType must be either "percent" or "flat"',
  })
  discountType?: 'percent' | 'flat';

  @ApiPropertyOptional({
    example: 10,
    description: 'Custom discount value/amount (e.g., 10 for 10% or 10 for flat $10)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Alias for discountAmount',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
