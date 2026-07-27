import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { TicketItem } from './entities/ticket-item.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { User, Role } from '../users/entities/user.entity';
import { CreateTicketDto, CreateTicketItemDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { PaginatedTicketsDto } from './dto/paginated-tickets.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(TicketItem)
    private readonly ticketItemRepository: Repository<TicketItem>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createTicketDto: CreateTicketDto,
    waiter: User,
  ): Promise<TicketResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const menuItemRepo = manager.getRepository(MenuItem);
      const ticketRepo = manager.getRepository(Ticket);
      const ticketItemRepo = manager.getRepository(TicketItem);

      // Verify active order
      const order = await orderRepo.findOne({
        where: { id: createTicketDto.orderId },
      });
      if (!order) {
        throw new NotFoundException(
          `Order with ID "${createTicketDto.orderId}" not found`,
        );
      }
      if (order.status !== OrderStatus.ACTIVE) {
        throw new BadRequestException(
          `Cannot place ticket: Associated order is in status "${order.status}"`,
        );
      }

      // Verify all menu items exist and are available
      const itemsToSave: TicketItem[] = [];
      for (const itemDto of createTicketDto.items) {
        const menuItem = await menuItemRepo.findOne({
          where: { id: itemDto.menuItemId },
        });
        if (!menuItem) {
          throw new NotFoundException(
            `MenuItem with ID "${itemDto.menuItemId}" not found`,
          );
        }
        if (!menuItem.isAvailable) {
          throw new BadRequestException(
            `MenuItem "${menuItem.name}" is currently not available`,
          );
        }

        const ticketItem = ticketItemRepo.create({
          menuItemId: menuItem.id,
          quantity: itemDto.quantity,
          specialInstructions: itemDto.specialInstructions || null,
        });
        itemsToSave.push(ticketItem);
      }

      // Create ticket
      const ticket = ticketRepo.create({
        orderId: order.id,
        assignedWaiterId: waiter.id,
        status: TicketStatus.PENDING,
        items: itemsToSave,
      });

      const savedTicket = await ticketRepo.save(ticket);

      // Load with full relations for response
      const fullyLoadedTicket = await ticketRepo.findOne({
        where: { id: savedTicket.id },
        relations: {
          assignedWaiter: true,
          assignedChef: true,
          items: {
            menuItem: true,
          },
        },
      });

      return TicketResponseDto.fromEntity(fullyLoadedTicket);
    });
  }

  async findAll(queryDto: TicketQueryDto): Promise<PaginatedTicketsDto> {
    const {
      page,
      limit,
      status,
      orderId,
      assignedWaiterId,
      assignedChefId,
      sortBy,
      sortOrder,
    } = queryDto;

    const queryBuilder = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.assignedWaiter', 'waiter')
      .leftJoinAndSelect('ticket.assignedChef', 'chef')
      .leftJoinAndSelect('ticket.items', 'item')
      .leftJoinAndSelect('item.menuItem', 'menuItem');

    if (status) {
      queryBuilder.andWhere('ticket.status = :status', { status });
    }

    if (orderId) {
      queryBuilder.andWhere('ticket.orderId = :orderId', { orderId });
    }

    if (assignedWaiterId) {
      queryBuilder.andWhere('ticket.assignedWaiterId = :assignedWaiterId', {
        assignedWaiterId,
      });
    }

    if (assignedChefId) {
      queryBuilder.andWhere('ticket.assignedChefId = :assignedChefId', {
        assignedChefId,
      });
    }

    const validSortFields = ['createdAt', 'status'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`ticket.${orderField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: TicketResponseDto.fromEntities(items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        assignedWaiter: true,
        assignedChef: true,
        items: {
          menuItem: true,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    return TicketResponseDto.fromEntity(ticket);
  }

  async updateTicketStatus(
    id: string,
    updateDto: UpdateTicketStatusDto,
    currentUser: User,
  ): Promise<TicketResponseDto> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: {
        assignedWaiter: true,
        assignedChef: true,
        items: {
          menuItem: true,
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID "${id}" not found`);
    }

    const currentStatus = ticket.status;
    const targetStatus = updateDto.status;

    if (currentStatus === targetStatus) {
      return TicketResponseDto.fromEntity(ticket);
    }

    // Prohibit changes to completed statuses
    if (
      currentStatus === TicketStatus.SERVED ||
      currentStatus === TicketStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot update status from terminal state "${currentStatus}"`,
      );
    }

    // Role-based action checks & transition validations
    if (targetStatus === TicketStatus.PREPARING) {
      // Transition: PENDING -> PREPARING
      if (currentStatus !== TicketStatus.PENDING) {
        throw new BadRequestException(
          `Cannot transition ticket from "${currentStatus}" to "${targetStatus}"`,
        );
      }

      // Check role permission
      if (
        currentUser.role !== Role.CHEF &&
        currentUser.role !== Role.MANAGER &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new ForbiddenException(
          'Only Chefs, Managers, and Admins can start preparing a ticket',
        );
      }

      // Assign Chef
      if (updateDto.chefId) {
        // Resolve chef user from DB
        const userRepo = this.dataSource.getRepository(User);
        const chefUser = await userRepo.findOne({
          where: { id: updateDto.chefId },
        });
        if (!chefUser) {
          throw new NotFoundException(
            `Chef with ID "${updateDto.chefId}" not found`,
          );
        }
        if (
          chefUser.role !== Role.CHEF &&
          chefUser.role !== Role.MANAGER &&
          chefUser.role !== Role.ADMIN
        ) {
          throw new BadRequestException(
            `User "${chefUser.fullName}" does not have Chef/Manager/Admin role`,
          );
        }
        ticket.assignedChef = chefUser;
        ticket.assignedChefId = chefUser.id;
      } else if (
        currentUser.role === Role.CHEF ||
        currentUser.role === Role.MANAGER ||
        currentUser.role === Role.ADMIN
      ) {
        // Self-assign
        ticket.assignedChef = currentUser;
        ticket.assignedChefId = currentUser.id;
      }
    } else if (targetStatus === TicketStatus.READY) {
      // Transition: PREPARING -> READY
      if (currentStatus !== TicketStatus.PREPARING) {
        throw new BadRequestException(
          `Cannot transition ticket from "${currentStatus}" to "${targetStatus}"`,
        );
      }

      // Check role permission
      if (
        currentUser.role !== Role.CHEF &&
        currentUser.role !== Role.MANAGER &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new ForbiddenException(
          'Only Chefs, Managers, and Admins can mark a ticket as ready',
        );
      }
    } else if (targetStatus === TicketStatus.SERVED) {
      // Transition: READY -> SERVED
      if (currentStatus !== TicketStatus.READY) {
        throw new BadRequestException(
          `Cannot transition ticket from "${currentStatus}" to "${targetStatus}"`,
        );
      }

      // Check role permission
      if (
        currentUser.role !== Role.WAITER &&
        currentUser.role !== Role.MANAGER &&
        currentUser.role !== Role.ADMIN
      ) {
        throw new ForbiddenException(
          'Only Waiters, Managers, and Admins can mark a ticket as served',
        );
      }
    } else if (targetStatus === TicketStatus.CANCELLED) {
      // Transition: PENDING/PREPARING/READY -> CANCELLED
      // All authenticated roles (including chef in case of ingredient issues, waiter, manager) can cancel
      // No extra role checks needed since controller enforces JwtAuthGuard
    } else {
      throw new BadRequestException(`Unknown ticket status: ${targetStatus}`);
    }

    ticket.status = targetStatus;
    const savedTicket = await this.ticketRepository.save(ticket);

    return TicketResponseDto.fromEntity(savedTicket);
  }

  async updateTicketItems(
    id: string,
    itemsDto: CreateTicketItemDto[],
  ): Promise<TicketResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const ticketRepo = manager.getRepository(Ticket);
      const ticketItemRepo = manager.getRepository(TicketItem);
      const menuItemRepo = manager.getRepository(MenuItem);

      const ticket = await ticketRepo.findOne({
        where: { id },
        relations: {
          assignedWaiter: true,
          assignedChef: true,
        },
      });

      if (!ticket) {
        throw new NotFoundException(`Ticket with ID "${id}" not found`);
      }

      if (ticket.status !== TicketStatus.PENDING) {
        throw new BadRequestException(
          `Cannot modify ticket items: Ticket is in status "${ticket.status}" (must be PENDING)`,
        );
      }

      // Verify all menu items exist and are available
      const newItems: TicketItem[] = [];
      for (const itemDto of itemsDto) {
        const menuItem = await menuItemRepo.findOne({
          where: { id: itemDto.menuItemId },
        });
        if (!menuItem) {
          throw new NotFoundException(
            `MenuItem with ID "${itemDto.menuItemId}" not found`,
          );
        }
        if (!menuItem.isAvailable) {
          throw new BadRequestException(
            `MenuItem "${menuItem.name}" is currently not available`,
          );
        }

        const ticketItem = ticketItemRepo.create({
          ticketId: ticket.id,
          menuItemId: menuItem.id,
          quantity: itemDto.quantity,
          specialInstructions: itemDto.specialInstructions || null,
        });
        newItems.push(ticketItem);
      }

      // Delete existing ticket items
      await ticketItemRepo.delete({ ticketId: ticket.id });

      // Save new ticket items
      ticket.items = newItems;
      const savedTicket = await ticketRepo.save(ticket);

      // Return fully loaded ticket details
      const fullyLoadedTicket = await ticketRepo.findOne({
        where: { id: savedTicket.id },
        relations: {
          assignedWaiter: true,
          assignedChef: true,
          items: {
            menuItem: true,
          },
        },
      });

      return TicketResponseDto.fromEntity(fullyLoadedTicket);
    });
  }
}
