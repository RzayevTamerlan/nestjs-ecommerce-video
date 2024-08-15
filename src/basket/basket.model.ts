import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_MODEL_NAME } from '../users/users.constants';
import { UsersDocument } from '../users/users.model';
import { BasketProductDocument, BasketProductSchema } from './basket-product.model';

export type BasketsDocument = HydratedDocument<BasketModel>;

@Schema({ timestamps: true })
export class BasketModel {
  @Prop({type: mongoose.Schema.Types.ObjectId, unique: true, ref: USER_MODEL_NAME})
  user: UsersDocument;

  @Prop({type: [BasketProductSchema], default: []})
  products: BasketProductDocument[];

  @Prop({type: Number, default: 0})
  totalPrice: number;

  @Prop({type: Number, default: 0})
  totalQuantity: number;
}

export const BasketSchema = SchemaFactory.createForClass(BasketModel);
