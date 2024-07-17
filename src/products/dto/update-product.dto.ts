import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class UpdateProductDto {
  @IsMongoId()
  id: mongoose.Schema.Types.ObjectId;
}