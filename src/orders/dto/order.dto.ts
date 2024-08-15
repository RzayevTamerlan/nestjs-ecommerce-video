import { BasketProductDocument } from '../../basket/basket-product.model';

export class OrderDto {
  totalPrice: number;
  totalQuantity: number;
  address: string;
  phone: string;
  products: BasketProductDocument[];
}