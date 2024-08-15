import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ORDERS_MODEL_NAME } from './orders.constants';
import { OrdersSchema } from './orders.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ORDERS_MODEL_NAME, schema: OrdersSchema },
    ]),
  ],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {
}
