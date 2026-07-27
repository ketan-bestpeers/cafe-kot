import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { TicketItem } from './entities/ticket-item.entity';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { OrdersModule } from '../orders/orders.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, TicketItem]),
    OrdersModule,
    MenuItemsModule,
    UsersModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
  exports: [TicketsService, TypeOrmModule],
})
export class TicketsModule {}
