import { ApiProperty } from '@nestjs/swagger';
import { Ticket, TicketStatus } from '../entities/ticket.entity';
import { TicketItem } from '../entities/ticket-item.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { MenuItemResponseDto } from '../../menu-items/dto/menu-item-response.dto';

export class TicketItemResponseDto {
  @ApiProperty({
    example: 'c2b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the ticket item (UUID)',
  })
  id: string;

  @ApiProperty({
    type: () => MenuItemResponseDto,
    description: 'The menu item ordered',
  })
  menuItem: MenuItemResponseDto;

  @ApiProperty({
    example: 2,
    description: 'Quantity of the menu item',
  })
  quantity: number;

  @ApiProperty({
    example: 'No sugar',
    description: 'Special cooking instructions',
    nullable: true,
  })
  specialInstructions: string | null;

  static fromEntity(item: TicketItem): TicketItemResponseDto {
    if (!item) return null;
    const dto = new TicketItemResponseDto();
    dto.id = item.id;
    dto.menuItem = MenuItemResponseDto.fromEntity(item.menuItem);
    dto.quantity = item.quantity;
    dto.specialInstructions = item.specialInstructions;
    return dto;
  }

  static fromEntities(items: TicketItem[]): TicketItemResponseDto[] {
    return (items || []).map((item) => TicketItemResponseDto.fromEntity(item));
  }
}

export class TicketResponseDto {
  @ApiProperty({
    example: 'd3b07384-d113-4956-a5db-e7c60c87428b',
    description: 'Unique identifier of the KOT ticket (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'The order (session) ID this ticket belongs to',
  })
  orderId: string;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'The waiter who assigned/created this ticket',
  })
  assignedWaiter: UserResponseDto;

  @ApiProperty({
    example: 'a4d53896-fa3d-4c3d-b49d-b4b12e345678',
    description: 'The ID of the waiter who took the order',
  })
  assignedWaiterId: string;

  @ApiProperty({
    type: () => UserResponseDto,
    description: 'The chef assigned to cook this ticket',
    nullable: true,
  })
  assignedChef: UserResponseDto | null;

  @ApiProperty({
    example: 'b5e64907-fb4e-5d4e-c5ae-c5c23f456789',
    description: 'The ID of the chef assigned to the ticket',
    nullable: true,
  })
  assignedChefId: string | null;

  @ApiProperty({
    example: TicketStatus.PENDING,
    description: 'Current preparation status of the KOT ticket',
    enum: TicketStatus,
  })
  status: TicketStatus;

  @ApiProperty({
    type: () => [TicketItemResponseDto],
    description: 'List of food/drink items in this ticket',
  })
  items: TicketItemResponseDto[];

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when the ticket was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-07-27T12:00:00.000Z',
    description: 'Timestamp when the ticket was last updated',
  })
  updatedAt: Date;

  static fromEntity(ticket: Ticket): TicketResponseDto {
    if (!ticket) return null;
    const dto = new TicketResponseDto();
    dto.id = ticket.id;
    dto.orderId = ticket.orderId;
    dto.assignedWaiterId = ticket.assignedWaiterId;
    dto.assignedWaiter = UserResponseDto.fromEntity(ticket.assignedWaiter);
    dto.assignedChefId = ticket.assignedChefId;
    dto.assignedChef = UserResponseDto.fromEntity(ticket.assignedChef);
    dto.status = ticket.status;
    dto.createdAt = ticket.createdAt;
    dto.updatedAt = ticket.updatedAt;

    if (ticket.items) {
      dto.items = TicketItemResponseDto.fromEntities(ticket.items);
    } else {
      dto.items = [];
    }

    return dto;
  }

  static fromEntities(tickets: Ticket[]): TicketResponseDto[] {
    return (tickets || []).map((ticket) =>
      TicketResponseDto.fromEntity(ticket),
    );
  }
}
