import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Bill, PaymentMode } from '../entities/bill.entity';
import { CouponResponseDto } from '../../coupons/dto/coupon-response.dto';

export class BillResponseDto {
  @ApiProperty({
    example: 'b1d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Unique identifier of the bill',
  })
  id: string;

  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Associated Order ID',
  })
  orderId: string;

  @ApiProperty({
    example: 100.0,
    description: 'Subtotal before discounts and taxes',
  })
  subtotal: number;

  @ApiPropertyOptional({
    type: () => CouponResponseDto,
    description: 'The coupon applied to this bill',
  })
  coupon?: CouponResponseDto | null;

  @ApiPropertyOptional({
    example: 'c1d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'The coupon ID applied to this bill',
  })
  couponId?: string | null;

  @ApiProperty({
    example: 10.0,
    description: 'Discount amount applied',
  })
  discountAmount: number;

  @ApiProperty({
    example: 5.0,
    description: 'GST tax rate applied in percentage',
  })
  gstRate: number;

  @ApiProperty({
    example: 4.5,
    description: 'GST tax amount added',
  })
  gstAmount: number;

  @ApiProperty({
    example: 94.5,
    description: 'Grand total of the bill',
  })
  grandTotal: number;

  @ApiPropertyOptional({
    enum: PaymentMode,
    example: PaymentMode.UPI,
    description: 'Chosen payment mode',
  })
  paymentMode: PaymentMode | null;

  @ApiPropertyOptional({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when payment was received',
  })
  paidAt: Date | null;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when bill was generated',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when bill was last updated',
  })
  updatedAt: Date;

  static fromEntity(bill: Bill): BillResponseDto {
    if (!bill) return null;
    const dto = new BillResponseDto();
    dto.id = bill.id;
    dto.orderId = bill.orderId;
    dto.subtotal =
      typeof bill.subtotal === 'string'
        ? parseFloat(bill.subtotal)
        : bill.subtotal;
    dto.couponId = bill.couponId;
    dto.discountAmount =
      typeof bill.discountAmount === 'string'
        ? parseFloat(bill.discountAmount)
        : bill.discountAmount;
    dto.gstRate =
      typeof bill.gstRate === 'string'
        ? parseFloat(bill.gstRate)
        : bill.gstRate;
    dto.gstAmount =
      typeof bill.gstAmount === 'string'
        ? parseFloat(bill.gstAmount)
        : bill.gstAmount;
    dto.grandTotal =
      typeof bill.grandTotal === 'string'
        ? parseFloat(bill.grandTotal)
        : bill.grandTotal;
    dto.paymentMode = bill.paymentMode;
    dto.paidAt = bill.paidAt;
    dto.createdAt = bill.createdAt;
    dto.updatedAt = bill.updatedAt;

    if (bill.coupon) {
      dto.coupon = CouponResponseDto.fromEntity(bill.coupon);
    }
    return dto;
  }
}
