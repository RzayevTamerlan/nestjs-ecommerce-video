import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { USER_MODEL_NAME } from './users.constants';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from './users.model';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: USER_MODEL_NAME, schema: UsersSchema },
    ]),
    ProductsModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
