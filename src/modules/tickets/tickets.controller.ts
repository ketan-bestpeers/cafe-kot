import {
  Controller,
  Get,
  Post,
  Put,
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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { UpdateTicketItemsDto } from './dto/update-ticket-items.dto';
import { TicketQueryDto } from './dto/ticket-query.dto';
import { TicketResponseDto } from './dto/ticket-response.dto';
import { PaginatedTicketsDto } from './dto/paginated-tickets.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, User } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({
    summary: 'Create a new Kitchen Order Ticket (KOT)',
    description:
      'Creates a new KOT ticket under an active order session. Waiter is automatically assigned to the authenticated user.',
  })
  @ApiCreatedResponse({
    description: 'Ticket has been successfully created.',
    type: TicketResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Order session is not active, menu item not available, or invalid input data.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Order or menu item not found.' })
  create(
    @Body() createTicketDto: CreateTicketDto,
    @CurrentUser() waiter: User,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.create(createTicketDto, waiter);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tickets (Paginated)',
    description:
      'Retrieves a list of all tickets matching query filters and pagination details.',
  })
  @ApiOkResponse({
    description: 'List of tickets returned with pagination metadata.',
    type: PaginatedTicketsDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  findAll(@Query() queryDto: TicketQueryDto): Promise<PaginatedTicketsDto> {
    return this.ticketsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get ticket details by ID',
    description:
      'Retrieves complete details of a KOT ticket including its items, assigned waiter, and assigned chef.',
  })
  @ApiOkResponse({
    description: 'Ticket details returned.',
    type: TicketResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiNotFoundResponse({ description: 'Ticket not found.' })
  findById(@Param('id') id: string): Promise<TicketResponseDto> {
    return this.ticketsService.findById(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update ticket status (State transition)',
    description:
      'Enforces strict state transitions for KOT: PENDING -> PREPARING (assigns Chef) -> READY -> SERVED. CANCELLED is allowed from any prior state.',
  })
  @ApiOkResponse({
    description: 'Ticket status successfully updated.',
    type: TicketResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid transition path or terminal status modification attempt.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Lacks required role for status transition.',
  })
  @ApiNotFoundResponse({ description: 'Ticket or Chef not found.' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketStatusDto,
    @CurrentUser() user: User,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.updateTicketStatus(id, updateDto, user);
  }

  @Put(':id/items')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN, Role.MANAGER, Role.WAITER)
  @ApiOperation({
    summary: 'Update ticket items',
    description:
      'Enables modifying ordered items while the ticket is still in PENDING status.',
  })
  @ApiOkResponse({
    description: 'Ticket items successfully updated.',
    type: TicketResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Ticket is not in PENDING status or invalid item lists.',
  })
  @ApiUnauthorizedResponse({
    description: 'JWT authentication token is missing or invalid.',
  })
  @ApiForbiddenResponse({
    description: 'Access denied due to role restrictions.',
  })
  @ApiNotFoundResponse({ description: 'Ticket or Menu Item not found.' })
  updateItems(
    @Param('id') id: string,
    @Body() updateDto: UpdateTicketItemsDto,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.updateTicketItems(id, updateDto.items);
  }
}
