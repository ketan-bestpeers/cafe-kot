import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order } from './order.entity';
import { Coupon } from '../../coupons/entities/coupon.entity';

export enum PaymentMode {
  CASH = 'CASH',
  UPI = 'UPI',
  CARD = 'CARD',
}

export class ColumnNumericTransformer {
  to(data: number | null): number | null {
    return data;
  }
  from(data: string | null): number | null {
    return data !== null ? parseFloat(data) : null;
  }
}

@Entity('bills')
export class Bill {
  @ApiProperty({
    example: 'b1d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Unique identifier of the bill',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.bill, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Associated Order ID',
  })
  @Column({ type: 'uuid', unique: true })
  @Index()
  orderId: string;

  @ApiProperty({
    example: 100.0,
    description: 'Subtotal before discounts and taxes',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  subtotal: number;

  @ManyToOne(() => Coupon, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'couponId' })
  coupon: Coupon | null;

  @ApiPropertyOptional({
    example: 'c1d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Coupon ID applied to this bill',
  })
  @Column({ type: 'uuid', nullable: true })
  couponId: string | null;

  @ApiProperty({
    example: 10.0,
    description: 'Calculated discount amount deducted from subtotal',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  discountAmount: number;

  @ApiProperty({
    example: 5.0,
    description: 'GST rate applied in percentage (e.g. 5.00 for 5%)',
  })
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  gstRate: number;

  @ApiProperty({
    example: 4.5,
    description: 'Calculated GST amount added to discounted total',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  gstAmount: number;

  @ApiProperty({
    example: 94.5,
    description: 'Calculated grand total to be paid',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  grandTotal: number;

  @ApiPropertyOptional({
    enum: PaymentMode,
    example: PaymentMode.UPI,
    description: 'Mode of payment chosen for fulfillment',
  })
  @Column({
    type: 'enum',
    enum: PaymentMode,
    nullable: true,
  })
  paymentMode: PaymentMode | null;

  @ApiPropertyOptional({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when payment was received',
  })
  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
