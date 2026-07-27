import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Ticket } from './ticket.entity';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';

@Entity('ticket_items')
export class TicketItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @Column({ type: 'uuid' })
  @Index()
  ticketId: string;

  @ManyToOne(() => MenuItem, { nullable: false, onDelete: 'RESTRICT' })
  menuItem: MenuItem;

  @Column({ type: 'uuid' })
  @Index()
  menuItemId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
