import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BasketProductDocument, BasketProductSchema } from '../basket/basket-product.model';
import { USER_MODEL_NAME } from '../users/users.constants';
import { UsersDocument } from '../users/users.model';

export type OrdersDocument = HydratedDocument<OrdersModel>;

@Schema({ timestamps: true })
export class OrdersModel {
  @Prop({ type: [BasketProductSchema], default: [] })
  products: BasketProductDocument[];

  @Prop({ type: Number, required: true })
  totalPrice: number;

  @Prop({ type: Number, required: true })
  totalQuantity: number;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({type: mongoose.Schema.Types.ObjectId, ref: USER_MODEL_NAME})
  user: UsersDocument;
}

export const OrdersSchema = SchemaFactory.createForClass(OrdersModel);
