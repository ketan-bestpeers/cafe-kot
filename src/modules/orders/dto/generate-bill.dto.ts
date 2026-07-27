import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
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
}
