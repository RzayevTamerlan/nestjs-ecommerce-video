import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PRODUCT_ALREADY_IN_WISHLIST, USER_MODEL_NAME } from './users.constants';
import { UsersDocument } from './users.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Model, Types } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { genSalt, hash } from 'bcryptjs';
import { deleteCache } from '../common/utils/deleteCache';
import { Cache } from 'cache-manager';
import { USER_NOT_FOUND } from '../auth/auth.constants';
import { PRODUCT_NOT_FOUND } from '../products/products.constants';
import { ProductsService } from '../products/products.service';
import { WishlistDto } from './dto/wishlist.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_MODEL_NAME) private readonly userModel: Model<UsersDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly productService: ProductsService,
  ) {
  }

  async createUser(createUserDto: RegisterDto) {
    const salt = await genSalt(10);
    const hashedPassword = await hash(createUserDto.password, salt);

    const user = new this.userModel({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    await user.save();
    await deleteCache(this.cacheManager, 'users');
    const { passwordHash, ...result } = user.toObject();

    return result;
  }

  async findUserByEmail(email: string): Promise<UsersDocument> {
    const cacheKey = `users-${email}`;
    const cachedUser: UsersDocument = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findOne({ email })
      .lean()
      .exec();

    await this.cacheManager.set(cacheKey, user);

    return user;
  }

  async findUserById(id: Types.ObjectId): Promise<UsersDocument> {
    const cacheKey = `users-${id}`;
    const cachedUser: UsersDocument = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.userModel.findById(id)
      .lean()
      .exec();

    if(!user) throw new NotFoundException(USER_NOT_FOUND)

    await this.cacheManager.set(cacheKey, user);

    return user;
  }

  async addProductToWishList(dto: WishlistDto, user: UsersDocument) {
    const { productId } = dto;
    const isProductInWishList = user.wishList.includes(productId);
    const isProductExist = await this.productService.getProductById(productId);

    if(!isProductExist) throw new NotFoundException(PRODUCT_NOT_FOUND);
    if(isProductInWishList) throw new ConflictException(PRODUCT_ALREADY_IN_WISHLIST);

    user.wishList.push(productId);
    await user.save();
    await deleteCache(this.cacheManager, 'users');
  }

  async removeProductFromWishList(dto: WishlistDto, user: UsersDocument) {
    const { productId } = dto;

    const isProductInWishList = user.wishList.includes(productId);

    if(!isProductInWishList) throw new NotFoundException(PRODUCT_ALREADY_IN_WISHLIST);

    user.wishList = user.wishList.filter(id => id.toString() !== productId.toString());
    await deleteCache(this.cacheManager, 'users');
    return await user.save();
  }
}
