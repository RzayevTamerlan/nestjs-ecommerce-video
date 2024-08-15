import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { USER_MODEL_NAME } from '../users/users.constants';
import { UsersDocument } from '../users/users.model';
import { PRODUCT_MODEL_NAME } from '../products/products.constants';
import { ProductsDocument } from '../products/products.model';

export type CommentsDocument = HydratedDocument<CommentsModel>;

@Schema({ timestamps: true })
export class CommentsModel {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Number, required: true })
  rating: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: USER_MODEL_NAME })
  user: UsersDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: PRODUCT_MODEL_NAME })
  product: ProductsDocument;
}

export const CommentsSchema = SchemaFactory.createForClass(CommentsModel);
