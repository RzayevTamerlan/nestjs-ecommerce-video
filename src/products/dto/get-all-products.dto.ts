import { IsOptional, IsNumber, Min, Max, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllProductsDto {
  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
  })
  @IsNumber()
  minPrice?: number = 0;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? 100000000 : parsedValue;
  })
  @IsNumber()
  maxPrice?: number = 100000000;

  @IsOptional()
  @Transform(({ value }) => value ? value.split(',').map((category: string) => category.trim()) : '')
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
  })
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number = 0;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? 1 : parsedValue;
  })
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    const parsedValue = Number(value);
    return isNaN(parsedValue) ? 12 : parsedValue;
  })
  @IsNumber()
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sort?: 'asc' | 'desc' = 'desc';
}
