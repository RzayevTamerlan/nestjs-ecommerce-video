import { IsString, MinLength } from 'class-validator';
import { CATEGORY_MIN_LENGTH_MESSAGE, CATEGORY_MUST_BE_STRING } from '../categories.constants';

export class CategoriesDto {
  @IsString({ message: CATEGORY_MUST_BE_STRING })
  @MinLength(2, { message: CATEGORY_MIN_LENGTH_MESSAGE })
  name: string;
}