import {
  ArrayNotEmpty,
  IsArray,
  IsMongoId, IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import mongoose, { Types } from 'mongoose';
import { Type } from 'class-transformer';

class Spec {
  @IsString()
  key: string;

  @IsString()
  value: string;
}

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  cardImage: string;

  @IsArray()
  @IsString({ each: true })
  sliderImages: string[];

  @IsNumber()
  @Min(1)
  price: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsMongoId()
  category: Types.ObjectId;

  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Spec)
  @ArrayNotEmpty()
  specs: Spec[];
}