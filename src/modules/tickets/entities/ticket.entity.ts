import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { TicketItem } from './ticket-item.entity';

export enum TicketStatus {
  PENDING = 'PENDING',
  PREPARING = 'PREPARING',
  READY = 'READY',
  SERVED = 'SERVED',
  CANCELLED = 'CANCELLED',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.tickets, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  order: Order;

  @Column({ type: 'uuid' })
  @Index()
  orderId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  assignedWaiter: User;

  @Column({ type: 'uuid' })
  @Index()
  assignedWaiterId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  assignedChef: User | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  assignedChefId: string | null;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  @Index()
  status: TicketStatus;

  @OneToMany(() => TicketItem, (item) => item.ticket, { cascade: true })
  items: TicketItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
