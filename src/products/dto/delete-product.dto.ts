import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';

export class DeleteProductDto {
  @IsMongoId()
  id: mongoose.Schema.Types.ObjectId;
}