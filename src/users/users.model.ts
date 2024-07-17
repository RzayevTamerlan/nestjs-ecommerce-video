import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const UsersSchema = SchemaFactory.createForClass(UsersModel);