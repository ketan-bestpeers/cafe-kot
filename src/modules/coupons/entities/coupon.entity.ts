import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DiscountType {
  FLAT = 'FLAT',
  PERCENTAGE = 'PERCENTAGE',
}

export class ColumnNumericTransformer {
  to(data: number | null): number | null {
    return data;
  }
  from(data: string | null): number | null {
    return data !== null ? parseFloat(data) : null;
  }
}

@Entity('coupons')
export class Coupon {
  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Unique identifier of the coupon',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'SAVE20',
    description:
      'Unique discount coupon code (automatically converted to uppercase)',
  })
  @Column({ unique: true })
  @Index()
  code: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Type of discount (FLAT amount or PERCENTAGE of total)',
  })
  @Column({
    type: 'enum',
    enum: DiscountType,
  })
  discountType: DiscountType;

  @ApiProperty({
    example: 15.0,
    description:
      'Value of the discount (e.g. 15.00 for 15% or $15 flat discount)',
  })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  discountValue: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Expiry date/time of the coupon',
  })
  @Column({ type: 'timestamp', nullable: true })
  expirationDate: Date | null;

  @ApiProperty({
    example: true,
    description: 'Whether the coupon is active and valid for use',
  })
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
