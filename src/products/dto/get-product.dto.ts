import { IsMongoId } from 'class-validator';
import { Types } from 'mongoose';

export class GetProductDto {
  @IsMongoId()
  id: Types.ObjectId;
}