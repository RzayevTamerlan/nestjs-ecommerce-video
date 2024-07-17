import mongoose, { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CATEGORY_MODEL_NAME } from '../categories/categories.constants';
import { SpecsDocument, SpecsSchema } from './specs.model';

export type ProductsDocument = HydratedDocument<ProductsModel>;

@Schema({ timestamps: true })
export class ProductsModel {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  cardImage: string;

  @Prop({ type: [String], required: true })
  sliderImages: string[];

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: CATEGORY_MODEL_NAME })
  category: Types.ObjectId;

  @Prop({ type: [String], required: true })
  colors: string[];

  @Prop({ type: Number, required: true })
  rating: number;

  @Prop({ type: [SpecsSchema], default: [] })
  specs: SpecsDocument[];
}

export const ProductsSchema = SchemaFactory.createForClass(ProductsModel);
