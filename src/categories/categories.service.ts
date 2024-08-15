import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CATEGORY_EXISTS_ERROR_MESSAGE, CATEGORY_MODEL_NAME, CATEGORY_NOT_FOUND } from './categories.constants';
import { Model } from 'mongoose';
import { CategoriesDocument } from './categories.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CategoriesDto } from './dto/categories.dto';
import { deleteCache } from '../common/utils/deleteCache';
import { Types } from 'mongoose';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CATEGORY_MODEL_NAME) private readonly categoryModel: Model<CategoriesDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
  }

  async getAllCategories(): Promise<CategoriesDocument[]> {
    const cacheKey = 'category-all';
    const cache: CategoriesDocument[] = await this.cacheManager.get(cacheKey);

    if (cache) {
      return cache;
    }

    const categories = await this.categoryModel
      .find()
      .lean()
      .exec();
    await this.cacheManager.set(cacheKey, categories, 60 * 5 * 1000);
    return categories;
  }

  async createCategory(category: CategoriesDto): Promise<CategoriesDocument> {
    const isCategoryExist = await this.categoryModel.exists({ name: category.name }).exec();

    if (isCategoryExist) {
      throw new ConflictException(CATEGORY_EXISTS_ERROR_MESSAGE);
    }

    await deleteCache(this.cacheManager, 'category');

    const newCategory = new this.categoryModel(category);
    return await newCategory.save();
  }

  async findCategoryById(id: Types.ObjectId): Promise<CategoriesDocument> {
    const cacheKey = `category-${id}`;
    const cache: CategoriesDocument = await this.cacheManager.get(cacheKey);

    if(cache) {
      return cache;
    }

    const category = await this.categoryModel.findById(id).lean().exec();

    if(!category) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    await this.cacheManager.set(cacheKey, category, 60 * 5 * 1000);
    return category;
  }
}
