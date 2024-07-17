import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type SpecsDocument = HydratedDocument<SpecsModel>;

@Schema({ timestamps: true })
export class SpecsModel {
  @Prop({ type: String, required: true })
  key: string;

  @Prop({ type: String, required: true })
  value: string;
}

export const SpecsSchema = SchemaFactory.createForClass(SpecsModel);
