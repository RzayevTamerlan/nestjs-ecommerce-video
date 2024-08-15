import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class UpdateProductDto {
  @IsMongoId()
  id: Types.ObjectId;
}