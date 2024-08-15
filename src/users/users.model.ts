import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PRODUCT_MODEL_NAME } from '../products/products.constants';

export type UsersDocument = HydratedDocument<UsersModel>

export enum UserRoles {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Schema({ timestamps: true })
export class UsersModel {
  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: [String], enum: UserRoles, default: [UserRoles.CLIENT] })
  roles: UserRoles[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], default: [], ref: PRODUCT_MODEL_NAME })
  wishList: mongoose.Types.ObjectId[];
}

export const UsersSchema = SchemaFactory.createForClass(UsersModel);