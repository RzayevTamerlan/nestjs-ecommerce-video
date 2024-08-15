import { Module } from '@nestjs/common';
import { BasketController } from './basket.controller';
import { BasketService } from './basket.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BASKET_MODEL_NAME } from './basket.constants';
import { BasketSchema } from './basket.model';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BASKET_MODEL_NAME, schema: BasketSchema },
    ]),
    ProductsModule,
    OrdersModule
  ],
  controllers: [BasketController],
  providers: [BasketService],
  exports: [BasketService],
})
export class BasketModule {
}
