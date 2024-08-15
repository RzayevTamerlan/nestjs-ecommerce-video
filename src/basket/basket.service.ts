import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BASKET_MODEL_NAME, EMPTY_BASKET } from './basket.constants';
import { BasketsDocument } from './basket.model';
import { AddBasketDto } from './dto/add-basket.dto';
import { UsersDocument } from '../users/users.model';
import { ProductsService } from '../products/products.service';
import { PRODUCT_NOT_FOUND } from '../products/products.constants';
import { OrdersService } from '../orders/orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderDto } from '../orders/dto/order.dto';
import { deleteCache } from '../common/utils/deleteCache';

@Injectable()
export class BasketService {
  constructor(
    @InjectModel(BASKET_MODEL_NAME) private readonly basketModel: Model<BasketsDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {
  }

  async addProductToBasket(dto: AddBasketDto, user: UsersDocument) {
    console.log('addProductToBasket', dto.quantity);
    const basket = await this.checkIfBasketExists(user._id);
    const product = await this.productsService.getProductById(dto.productId);

    if (!product) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    // Преобразуем продукты в корзине, чтобы получить только id и количество
    const basketProductsWithIds = basket.products.map(product => ({
      product: product.product._id,
      quantity: product.quantity,
      price: product.product.price,
    }));

    // Проверяем, существует ли продукт в корзине
    const productIndex = basketProductsWithIds.findIndex(p => p.product.toString() === dto.productId.toString());
    if (productIndex !== -1) {
      // Если продукт уже есть в корзине, увеличиваем его количество
      console.log('productIndex', basketProductsWithIds[productIndex].quantity);
      basketProductsWithIds[productIndex].quantity += dto.quantity;
      console.log('productIndexAfter', basketProductsWithIds[productIndex].quantity);
    } else {
      // Если продукта нет в корзине, добавляем его
      basketProductsWithIds.push({ product: dto.productId, quantity: dto.quantity, price: product.price });
    }

    // Пересчитываем totalPrice и totalQuantity
    const totalPrice = basketProductsWithIds.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const totalQuantity = basketProductsWithIds.reduce((sum, p) => sum + p.quantity, 0);
    console.log(totalPrice, totalQuantity);
    // Обновляем продукты в корзине и сохраняем
    console.log('Before save', basketProductsWithIds);

    await deleteCache(this.cacheManager, `basket-${user._id}`);
    return this.basketModel.findByIdAndUpdate(
      basket._id,
      { products: basketProductsWithIds, totalPrice, totalQuantity },
      { new: true },
    ).populate({
      'path': 'products.product',
    });
  }

  async removeProductFromBasket(dto: AddBasketDto, user: UsersDocument) {
    const basket = await this.checkIfBasketExists(user._id);
    const product = await this.productsService.getProductById(dto.productId);

    if (!product) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    // Преобразуем продукты в корзине, чтобы получить только id, количество и цену
    const basketProductsWithIds = basket.products.map(product => ({
      product: product.product._id,
      quantity: product.quantity,
      price: product.product.price,
    }));

    // Проверяем, существует ли продукт в корзине
    const productIndex = basketProductsWithIds.findIndex(p => p.product.toString() === dto.productId.toString());
    if (productIndex !== -1) {
      // Если продукт уже есть в корзине, уменьшаем его количество
      basketProductsWithIds[productIndex].quantity -= dto.quantity;
      if (basketProductsWithIds[productIndex].quantity <= 0) {
        // Если количество продукта меньше или равно 0, удаляем его из корзины
        basketProductsWithIds.splice(productIndex, 1);
      }
    }

    // Пересчитываем totalPrice и totalQuantity
    const totalPrice = basketProductsWithIds.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const totalQuantity = basketProductsWithIds.reduce((sum, p) => sum + p.quantity, 0);

    await deleteCache(this.cacheManager, `basket-${user._id}`);
    // Обновляем продукты в корзине и сохраняем
    return this.basketModel.findByIdAndUpdate(
      basket._id,
      { products: basketProductsWithIds, totalPrice, totalQuantity },
      { new: true },
    ).populate({
      'path': 'products.product',
    });
  }

  async clearBasket(user: UsersDocument) {
    const basket = await this.checkIfBasketExists(user._id);
    return this.basketModel.findByIdAndUpdate(
      basket._id,
      { products: [] },
      { new: true },
    );
  }

  async checkout(user: UsersDocument, dto: CheckoutDto) {
    const basket = await this.checkIfBasketExists(user._id);

    if (basket.products.length === 0) {
      throw new ConflictException(EMPTY_BASKET);
    }

    const orderDto: OrderDto = {
      totalPrice: basket.totalPrice,
      totalQuantity: basket.totalQuantity,
      address: dto.address,
      phone: dto.phone,
      products: basket.products,
    };

    const order = await this.ordersService.createOrder(orderDto, user);

    await this.clearBasket(user);

    return order;
  }

  async getBasket(user: UsersDocument) {
    return this.checkIfBasketExists(user._id);
  }

  async checkIfBasketExists(userId: Types.ObjectId) {
    console.log('checkIfBasketExists', userId);
    // Here I need to create basket in case if it doesn't exist for user
    const cacheKey = `basket-${userId}`;
    const cachedBasket: BasketsDocument = await this.cacheManager.get(cacheKey);

    if (cachedBasket) {
      return cachedBasket;
    }
    console.log('basket not found in cache');
    const basket = await this.basketModel.findOne({ user: userId })
      .populate({
        path: 'products.product',
      })
      .lean()
      .exec();
    console.log('basket', basket);
    if (basket) {
      await this.cacheManager.set(cacheKey, basket);
      return basket;
    }
    console.log('before createBasket', userId);
    return await this.createBasket(userId);
  }

  async createBasket(userId: Types.ObjectId) {
    const basket = new this.basketModel({ user: userId, products: [] });
    await basket.save();
    await this.cacheManager.del(`basket-${userId}`);
    return basket;
  }

}
