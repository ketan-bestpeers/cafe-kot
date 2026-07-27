import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Order, OrderStatus } from './entities/order.entity';
import { Bill } from './entities/bill.entity';
import { Table, TableStatus } from '../tables/entities/table.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { PaginatedOrdersDto } from './dto/paginated-orders.dto';
import { TicketStatus } from '../tickets/entities/ticket.entity';
import { CouponsService } from '../coupons/coupons.service';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { CompleteOrderDto } from './dto/complete-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
    private readonly couponsService: CouponsService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const tableRepo = manager.getRepository(Table);
      const orderRepo = manager.getRepository(Order);

      const table = await tableRepo.findOne({
        where: { id: createOrderDto.tableId },
      });
      if (!table) {
        throw new NotFoundException(
          `Table with ID "${createOrderDto.tableId}" not found`,
        );
      }

      if (table.status === TableStatus.OCCUPIED) {
        // Check if there is already an active order for this table
        const activeOrder = await orderRepo.findOne({
          where: { tableId: table.id, status: OrderStatus.ACTIVE },
        });
        if (activeOrder) {
          throw new BadRequestException(
            `Table ${table.number} is already occupied with active order ID "${activeOrder.id}"`,
          );
        }
      }

      // Update table status to occupied
      table.status = TableStatus.OCCUPIED;
      await tableRepo.save(table);

      // Create new order
      const order = orderRepo.create({
        tableId: table.id,
        status: OrderStatus.ACTIVE,
      });

      const savedOrder = await orderRepo.save(order);
      // Attach the table relation back for response construction
      savedOrder.table = table;

      return OrderResponseDto.fromEntity(savedOrder);
    });
  }

  async findAll(queryDto: OrderQueryDto): Promise<PaginatedOrdersDto> {
    const { page, limit, status, tableId, sortBy, sortOrder } = queryDto;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.table', 'table')
      .leftJoinAndSelect('order.bill', 'bill')
      .leftJoinAndSelect('bill.coupon', 'coupon')
      .leftJoinAndSelect('order.tickets', 'ticket')
      .leftJoinAndSelect('ticket.assignedWaiter', 'waiter')
      .leftJoinAndSelect('ticket.assignedChef', 'chef')
      .leftJoinAndSelect('ticket.items', 'item')
      .leftJoinAndSelect('item.menuItem', 'menuItem');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (tableId) {
      queryBuilder.andWhere('order.tableId = :tableId', { tableId });
    }

    const validSortFields = ['createdAt', 'status'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`order.${orderField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      data: OrderResponseDto.fromEntities(items),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        table: true,
        bill: {
          coupon: true,
        },
        tickets: {
          assignedWaiter: true,
          assignedChef: true,
          items: {
            menuItem: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return OrderResponseDto.fromEntity(order);
  }

  async completeOrder(
    id: string,
    completeOrderDto: CompleteOrderDto,
  ): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const billRepo = manager.getRepository(Bill);
      const tableRepo = manager.getRepository(Table);

      const order = await orderRepo.findOne({
        where: { id },
        relations: {
          table: true,
          bill: {
            coupon: true,
          },
          tickets: {
            assignedWaiter: true,
            assignedChef: true,
            items: {
              menuItem: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found`);
      }

      if (order.status !== OrderStatus.BILL_GENERATED) {
        throw new BadRequestException(
          `Cannot complete order: Order has status "${order.status}". Bill must be generated first.`,
        );
      }

      // Check if any non-cancelled tickets are not yet served
      if (order.tickets) {
        const activeTickets = order.tickets.filter(
          (t) =>
            t.status !== TicketStatus.SERVED &&
            t.status !== TicketStatus.CANCELLED,
        );
        if (activeTickets.length > 0) {
          throw new BadRequestException(
            `Cannot complete order: There are ${activeTickets.length} active tickets that are not served or cancelled`,
          );
        }
      }

      const bill = order.bill;
      if (!bill) {
        throw new BadRequestException(
          'No bill found for this order. Please generate bill first.',
        );
      }

      bill.paymentMode = completeOrderDto.paymentMode;
      bill.paidAt = new Date();
      await billRepo.save(bill);

      // Complete order
      order.status = OrderStatus.COMPLETED;
      const savedOrder = await orderRepo.save(order);

      // Revert table status to AVAILABLE
      const table = order.table;
      if (table) {
        table.status = TableStatus.AVAILABLE;
        await tableRepo.save(table);
      }

      return OrderResponseDto.fromEntity(savedOrder);
    });
  }

  async cancelOrder(id: string): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const tableRepo = manager.getRepository(Table);
      const billRepo = manager.getRepository(Bill);

      const order = await orderRepo.findOne({
        where: { id },
        relations: {
          table: true,
          bill: {
            coupon: true,
          },
          tickets: {
            assignedWaiter: true,
            assignedChef: true,
            items: {
              menuItem: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found`);
      }

      if (
        order.status !== OrderStatus.ACTIVE &&
        order.status !== OrderStatus.BILL_GENERATED
      ) {
        throw new BadRequestException(
          `Order has status "${order.status}" and cannot be cancelled`,
        );
      }

      // Cancel order
      order.status = OrderStatus.CANCELLED;

      // Hard delete bill if exists (to free up unique orderId constraint)
      if (order.bill) {
        await billRepo.remove(order.bill);
        order.bill = null;
      }

      const savedOrder = await orderRepo.save(order);

      // Cancel all pending or active tickets within this order
      if (order.tickets && order.tickets.length > 0) {
        const ticketRepo = manager.getRepository(order.tickets[0].constructor);
        for (const ticket of order.tickets) {
          if (
            ticket.status !== TicketStatus.CANCELLED &&
            ticket.status !== TicketStatus.SERVED
          ) {
            ticket.status = TicketStatus.CANCELLED;
            await ticketRepo.save(ticket);
          }
        }
      }

      // Revert table status to AVAILABLE
      const table = order.table;
      if (table) {
        table.status = TableStatus.AVAILABLE;
        await tableRepo.save(table);
      }

      return OrderResponseDto.fromEntity(savedOrder);
    });
  }

  async generateBill(
    id: string,
    generateBillDto: GenerateBillDto,
  ): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const billRepo = manager.getRepository(Bill);

      const order = await orderRepo.findOne({
        where: { id },
        relations: {
          table: true,
          bill: {
            coupon: true,
          },
          tickets: {
            assignedWaiter: true,
            assignedChef: true,
            items: {
              menuItem: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found`);
      }

      if (
        order.status !== OrderStatus.ACTIVE &&
        order.status !== OrderStatus.BILL_GENERATED
      ) {
        throw new BadRequestException(
          `Cannot generate bill: Order has status "${order.status}"`,
        );
      }

      // Verify all tickets are either SERVED or CANCELLED
      if (order.tickets) {
        const activeTickets = order.tickets.filter(
          (t) =>
            t.status !== TicketStatus.SERVED &&
            t.status !== TicketStatus.CANCELLED,
        );
        if (activeTickets.length > 0) {
          throw new BadRequestException(
            `Cannot generate bill: There are ${activeTickets.length} active tickets that are not served or cancelled`,
          );
        }
      }

      // Calculate subtotal
      let subtotal = 0;
      if (order.tickets) {
        for (const ticket of order.tickets) {
          if (ticket.status !== TicketStatus.CANCELLED && ticket.items) {
            for (const item of ticket.items) {
              if (item.menuItem && typeof item.menuItem.price === 'number') {
                subtotal += item.menuItem.price * item.quantity;
              }
            }
          }
        }
      }
      subtotal = Math.round(subtotal * 100) / 100;

      let coupon = null;
      let discountAmount = 0;

      if (generateBillDto.couponCode) {
        coupon = await this.couponsService.validateCoupon(
          generateBillDto.couponCode,
        );
        if (coupon.discountType === 'FLAT') {
          discountAmount = coupon.discountValue;
        } else if (coupon.discountType === 'PERCENTAGE') {
          discountAmount = (subtotal * coupon.discountValue) / 100;
        }
        discountAmount = Math.round(discountAmount * 100) / 100;
        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
      }

      const gstRate = this.configService.get<number>('app.gstRate') ?? 5.0;
      const gstAmount =
        Math.round((subtotal - discountAmount) * (gstRate / 100) * 100) / 100;
      const grandTotal =
        Math.round((subtotal - discountAmount + gstAmount) * 100) / 100;

      let bill = order.bill;
      if (!bill) {
        bill = billRepo.create({
          orderId: order.id,
          subtotal,
          couponId: coupon ? coupon.id : null,
          discountAmount,
          gstRate,
          gstAmount,
          grandTotal,
        });
      } else {
        bill.subtotal = subtotal;
        bill.couponId = coupon ? coupon.id : null;
        bill.coupon = coupon;
        bill.discountAmount = discountAmount;
        bill.gstRate = gstRate;
        bill.gstAmount = gstAmount;
        bill.grandTotal = grandTotal;
      }

      const savedBill = await billRepo.save(bill);
      order.bill = savedBill;
      order.status = OrderStatus.BILL_GENERATED;
      const savedOrder = await orderRepo.save(order);

      return OrderResponseDto.fromEntity(savedOrder);
    });
  }

  async voidBill(id: string): Promise<OrderResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(Order);
      const billRepo = manager.getRepository(Bill);

      const order = await orderRepo.findOne({
        where: { id },
        relations: {
          table: true,
          bill: {
            coupon: true,
          },
          tickets: {
            assignedWaiter: true,
            assignedChef: true,
            items: {
              menuItem: true,
            },
          },
        },
      });

      if (!order) {
        throw new NotFoundException(`Order with ID "${id}" not found`);
      }

      if (order.status !== OrderStatus.BILL_GENERATED) {
        throw new BadRequestException(
          `Cannot void bill: Order has status "${order.status}" (must be BILL_GENERATED)`,
        );
      }

      // Hard delete bill
      if (order.bill) {
        await billRepo.remove(order.bill);
        order.bill = null;
      }

      // Revert status to ACTIVE
      order.status = OrderStatus.ACTIVE;
      const savedOrder = await orderRepo.save(order);

      return OrderResponseDto.fromEntity(savedOrder);
    });
  }
}
