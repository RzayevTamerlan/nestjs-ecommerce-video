import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class GetProductDto {
  @IsMongoId()
  id: mongoose.Schema.Types.ObjectId;
}