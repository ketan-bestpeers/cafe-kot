import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Order, OrderStatus } from '../entities/order.entity';
import { TableResponseDto } from '../../tables/dto/table-response.dto';
import { TicketResponseDto } from '../../tickets/dto/ticket-response.dto';
import { BillResponseDto } from './bill-response.dto';

export class OrderResponseDto {
  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'Unique identifier of the order (UUID)',
  })
  id: string;

  @ApiProperty({
    type: () => TableResponseDto,
    description: 'The dining table associated with the order',
  })
  table: TableResponseDto;

  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Table ID associated with the order',
  })
  tableId: string;

  @ApiProperty({
    example: OrderStatus.ACTIVE,
    description: 'Current status of the order',
    enum: OrderStatus,
  })
  status: OrderStatus;

  @ApiProperty({
    type: () => [TicketResponseDto],
    description: 'List of kitchen order tickets associated with this order',
  })
  tickets: TicketResponseDto[];

  @ApiPropertyOptional({
    type: () => BillResponseDto,
    description: 'The billing summary, available once the bill is generated',
  })
  bill?: BillResponseDto | null;

  @ApiProperty({
    example: 45.5,
    description:
      'Total amount calculated dynamically from all ticket items or set from the generated bill',
  })
  totalAmount: number;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when the order was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when the order was last updated',
  })
  updatedAt: Date;

  static fromEntity(order: Order): OrderResponseDto {
    if (!order) return null;
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.table = TableResponseDto.fromEntity(order.table);
    dto.tableId = order.tableId;
    dto.status = order.status;
    dto.createdAt = order.createdAt;
    dto.updatedAt = order.updatedAt;

    // Map tickets if loaded
    if (order.tickets) {
      dto.tickets = TicketResponseDto.fromEntities(order.tickets);
    } else {
      dto.tickets = [];
    }

    // Calculate total amount
    if (order.bill) {
      dto.bill = BillResponseDto.fromEntity(order.bill);
      dto.totalAmount = dto.bill.grandTotal;
    } else {
      dto.bill = null;
      let total = 0;
      if (order.tickets) {
        for (const ticket of order.tickets) {
          if (ticket.status !== 'CANCELLED' && ticket.items) {
            for (const item of ticket.items) {
              if (item.menuItem && typeof item.menuItem.price === 'number') {
                total += item.menuItem.price * item.quantity;
              }
            }
          }
        }
      }
      dto.totalAmount = Math.round(total * 100) / 100;
    }

    return dto;
  }

  static fromEntities(orders: Order[]): OrderResponseDto[] {
    return (orders || []).map((order) => OrderResponseDto.fromEntity(order));
  }
}
