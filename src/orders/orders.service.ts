import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CANT_GET_ORDER, ORDER_NOT_FOUND, ORDERS_MODEL_NAME } from './orders.constants';
import { OrdersDocument } from './orders.model';
import { OrderDto } from './dto/order.dto';
import { UserRoles, UsersDocument } from '../users/users.model';
import { GetOrdersDto } from './dto/get-orders.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(ORDERS_MODEL_NAME) private readonly ordersModel: Model<OrdersDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
  }

  async createOrder(dto: OrderDto, user: UsersDocument) {
    const newOrder = new this.ordersModel({
      ...dto,
      user: user._id,
    });

    const order = await newOrder.save();
    await this.cacheManager.del('orders');
    return order;
  }

  async getMyOrders(user: UsersDocument, query: GetOrdersDto) {
    const cacheKey = `orders-${user._id}-${query.page}-${query.limit}`;
    const cachedOrders = await this.cacheManager.get(cacheKey);

    if (cachedOrders) {
      return cachedOrders;
    }

    const [orders, total] = await Promise.all([
      this.ordersModel.find({ user: user._id })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      this.ordersModel.countDocuments({ user: user._id }),
    ]);

    const response = {
      totalPages: Math.ceil(total / query.limit),
      page: query.page,
      limit: query.limit,
      data: orders,
    };

    await this.cacheManager.set(cacheKey, response, 60 * 60 * 1000);

    return response;
  }

  async getOrders(query: GetOrdersDto) {
    const cacheKey = `orders-${query.page}-${query.limit}`;

    const cachedOrders = await this.cacheManager.get(cacheKey);

    if (cachedOrders) {
      return cachedOrders;
    }

    const [orders, total] = await Promise.all([
      this.ordersModel.find()
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      this.ordersModel.countDocuments(),
    ]);

    const response = {
      totalPages: Math.ceil(total / query.limit),
      page: query.page,
      limit: query.limit,
      data: orders,
    }

    await this.cacheManager.set(cacheKey, response, 10 * 60 * 1000);

    return response;
  }

  async getOrder(user: UsersDocument, id: Types.ObjectId) {
    const order = await this.ordersModel.findOne({ _id: id });

    if (!order) {
      throw new NotFoundException(ORDER_NOT_FOUND);
    }
    if (!user.roles.includes(UserRoles.ADMIN) || !(order.user.toString() === user._id.toString())) {
      throw new ForbiddenException(CANT_GET_ORDER);
    }

    return order;
  }


}
