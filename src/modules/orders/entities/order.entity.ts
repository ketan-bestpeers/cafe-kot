import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Table } from '../../tables/entities/table.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Bill } from './bill.entity';

export enum OrderStatus {
  ACTIVE = 'ACTIVE',
  BILL_GENERATED = 'BILL_GENERATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Table, { nullable: false, onDelete: 'RESTRICT' })
  table: Table;

  @Column({ type: 'uuid' })
  @Index()
  tableId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.ACTIVE,
  })
  @Index()
  status: OrderStatus;

  @OneToMany(() => Ticket, (ticket) => ticket.order)
  tickets: Ticket[];

  @OneToOne(() => Bill, (bill) => bill.order, { cascade: true })
  bill: Bill;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
