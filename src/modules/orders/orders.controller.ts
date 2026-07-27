import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { PaginatedOrdersDto } from './dto/paginated-orders.dto';
import { GenerateBillDto } from './dto/generate-bill.dto';
import { CompleteOrderDto } from './dto/complete-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({
    summary: 'Create a new table order session',
    description:
      'Starts a dining session for the specified table and sets the table status to OCCUPIED.',
  })
  @ApiCreatedResponse({
    description: 'Order session started successfully.',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Table is already occupied or invalid input data.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Table not found.' })
  create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER, Role.CASHIER, Role.CHEF)
  @ApiOperation({
    summary: 'Get all orders (Paginated)',
    description:
      'Retrieves a list of all orders matching query filters and pagination details.',
  })
  @ApiOkResponse({
    description: 'List of orders returned with pagination metadata.',
    type: PaginatedOrdersDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  findAll(@Query() queryDto: OrderQueryDto): Promise<PaginatedOrdersDto> {
    return this.ordersService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order details by ID',
    description:
      'Retrieves complete details of an order session including its table info and all associated tickets.',
  })
  @ApiOkResponse({
    description: 'Order details returned.',
    type: OrderResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  findById(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findById(id);
  }

  @Post(':id/bill')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.WAITER)
  @ApiOperation({
    summary: 'Generate bill for order session',
    description:
      'Calculates the order total, applies the given coupon code (if valid), computes GST, generates a bill, and transitions order status to BILL_GENERATED.',
  })
  @ApiOkResponse({
    description: 'Bill successfully generated for the order.',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid coupon or not all tickets are served/cancelled.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  generateBill(
    @Param('id') id: string,
    @Body() generateBillDto: GenerateBillDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.generateBill(id, generateBillDto);
  }

  @Delete(':id/bill')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  @ApiOperation({
    summary: 'Void/cancel the generated bill',
    description:
      'Reverts the order status from BILL_GENERATED back to ACTIVE and soft-deletes the generated bill to allow editing/adding tickets.',
  })
  @ApiOkResponse({
    description: 'Bill successfully voided.',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Order status is not BILL_GENERATED.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  voidBill(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.voidBill(id);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER)
  @ApiOperation({
    summary: 'Complete order session',
    description:
      'Completes the order session, recording the chosen payment mode and paid timestamp, and sets the table status back to AVAILABLE.',
  })
  @ApiOkResponse({
    description: 'Order successfully completed.',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Order is not in BILL_GENERATED status, or has pending unserved/uncancelled tickets.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  completeOrder(
    @Param('id') id: string,
    @Body() completeOrderDto: CompleteOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.completeOrder(id, completeOrderDto);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.WAITER)
  @ApiOperation({
    summary: 'Cancel order session',
    description:
      'Cancels the active order session, cancels all active/pending tickets, and sets the table status back to AVAILABLE.',
  })
  @ApiOkResponse({
    description: 'Order successfully cancelled.',
    type: OrderResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Order is not active and cannot be cancelled.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Order not found.' })
  cancelOrder(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.cancelOrder(id);
  }
}
