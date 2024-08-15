import { IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetOrdersDto {
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
}