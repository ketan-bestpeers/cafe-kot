import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentMode } from '../entities/bill.entity';

export class CompleteOrderDto {
  @ApiProperty({
    enum: PaymentMode,
    example: PaymentMode.CASH,
    description: 'Mode of payment chosen for order fulfillment',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;
}
