import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PRODUCT_MODEL_NAME, PRODUCT_NOT_FOUND } from './products.constants';
import mongoose, { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ProductsDocument } from './products.model';
import { Cache } from 'cache-manager';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { ProductDto } from './dto/product.dto';
import { deleteCache } from '../common/utils/deleteCache';
import { CategoriesService } from '../categories/categories.service';
import { CATEGORY_NOT_FOUND } from '../categories/categories.constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(PRODUCT_MODEL_NAME) private readonly productModel: Model<ProductsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly categoriesService: CategoriesService,
  ) {
  }

  async getAllProducts({ minPrice, sort, maxPrice, rating, categories, page, limit }: GetAllProductsDto): Promise<any> {
    const key = `product-${sort}-${maxPrice}-${rating}-${categories}-${page}-${limit}-${minPrice}`;
    const cache = await this.cacheManager.get(key);

    if (cache) {
      return cache;
    }

    const filters = {
      price: { $gte: minPrice, $lte: maxPrice },
      rating: { $gte: rating },
      ...(categories && { category: { $in: categories } }),
    };

    const [products, totalDocuments] = await Promise.all([
      this.productModel.find(filters)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ price: sort === 'asc' ? 1 : -1 })
        .populate('category')
        .populate({
          path: 'comments',
          populate: [
            { path: 'user', select: '-passwordHash' },
          ]
        })
        .lean()
        .exec(),
      this.productModel.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(totalDocuments / limit);

    const result = {
      totalPages,
      perPage: limit,
      currentPage: page,
      total: totalDocuments,
      data: products,
    };

    await this.cacheManager.set(key, result, 60 * 5 * 1000);
    return result;
  }

  async getProductById(id: Types.ObjectId): Promise<ProductsDocument> {
    const cacheKey = `product-${id}`;
    const cache: ProductsDocument = await this.cacheManager.get(cacheKey);

    if (cache) {
      return cache;
    }

    const product = await this.productModel.findById(id)
      .populate('comments')
      .exec();

    if (!product) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    await this.cacheManager.set(cacheKey, product, 60 * 5 * 1000);
    return product;
  }

  async createProduct(product: ProductDto): Promise<ProductsDocument> {
    const isCategoryExsists = await this.categoriesService.findCategoryById(product.category);

    if(!isCategoryExsists) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    const newProduct = new this.productModel(product);

    await deleteCache(this.cacheManager, 'product');
    return await newProduct.save();
  }

  async updateProduct(id: Types.ObjectId, product: ProductDto): Promise<ProductsDocument> {
    const isProductExist = await this.productModel.findById(id)
      .lean()
      .exec();

    if (!isProductExist) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    const isCategoryExist = await this.categoriesService.findCategoryById(product.category);

    if(!isCategoryExist) {
      throw new NotFoundException(CATEGORY_NOT_FOUND);
    }

    await deleteCache(this.cacheManager, 'product');
    console.log('product', product);
    return await this.productModel.findByIdAndUpdate(id, product, { new: true }).exec();
  }

  async deleteProduct(id: mongoose.Schema.Types.ObjectId): Promise<null> {
    const isProductExist = await this.productModel.findById(id).exec();

    if (!isProductExist) {
      throw new NotFoundException(PRODUCT_NOT_FOUND);
    }

    await deleteCache(this.cacheManager, 'product');

    await this.productModel.findByIdAndDelete(id).exec();
    return null;
  }

}
