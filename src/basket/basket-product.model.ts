import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PRODUCT_MODEL_NAME } from '../products/products.constants';
import { ProductsDocument } from '../products/products.model';

export type BasketProductDocument = HydratedDocument<BasketProductModel>;

@Schema({ timestamps: true })
export class BasketProductModel {
  @Prop({type: mongoose.Schema.Types.ObjectId, ref: PRODUCT_MODEL_NAME})
  product: ProductsDocument;

  @Prop({type: Number, default: 0})
  quantity: number;
}

export const BasketProductSchema = SchemaFactory.createForClass(BasketProductModel);
