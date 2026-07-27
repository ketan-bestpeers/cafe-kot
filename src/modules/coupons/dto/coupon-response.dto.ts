import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coupon, DiscountType } from '../entities/coupon.entity';

export class CouponResponseDto {
  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Unique identifier of the coupon',
  })
  id: string;

  @ApiProperty({
    example: 'SAVE20',
    description: 'Unique discount coupon code',
  })
  code: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Type of discount',
  })
  discountType: DiscountType;

  @ApiProperty({
    example: 15.0,
    description: 'Value of the discount',
  })
  discountValue: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiry date/time of the coupon',
  })
  expirationDate: Date | null;

  @ApiProperty({
    example: true,
    description: 'Whether the coupon is active',
  })
  isActive: boolean;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when coupon was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when coupon was last updated',
  })
  updatedAt: Date;

  static fromEntity(coupon: Coupon): CouponResponseDto {
    if (!coupon) return null;
    const dto = new CouponResponseDto();
    dto.id = coupon.id;
    dto.code = coupon.code;
    dto.discountType = coupon.discountType;
    dto.discountValue = coupon.discountValue;
    dto.expirationDate = coupon.expirationDate;
    dto.isActive = coupon.isActive;
    dto.createdAt = coupon.createdAt;
    dto.updatedAt = coupon.updatedAt;
    return dto;
  }

  static fromEntities(coupons: Coupon[]): CouponResponseDto[] {
    return (coupons || []).map((c) => CouponResponseDto.fromEntity(c));
  }
}
