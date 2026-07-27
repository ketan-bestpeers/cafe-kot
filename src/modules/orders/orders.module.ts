import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Bill } from './entities/bill.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TablesModule } from '../tables/tables.module';
import { CouponsModule } from '../coupons/coupons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Bill]),
    TablesModule,
    CouponsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
