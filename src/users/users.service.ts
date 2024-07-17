import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { USER_MODEL_NAME } from './users.constants';
import { UsersDocument } from './users.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Model } from 'mongoose';
import { RegisterDto } from '../auth/dto/register.dto';
import { genSalt, hash } from 'bcryptjs';
import { deleteCache } from '../utils/deleteCache';
import { Cache } from 'cache-manager';
import { USER_NOT_FOUND } from '../auth/auth.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_MODEL_NAME) private readonly userModel: Model<UsersDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
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
}
