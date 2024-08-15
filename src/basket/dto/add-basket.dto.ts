import { Types } from 'mongoose';
import { IsMongoId, IsNumber, IsPositive } from 'class-validator';

export class AddBasketDto {
  @IsMongoId()
  productId: Types.ObjectId;

  @IsNumber()
  @IsPositive()
  quantity: number;
}