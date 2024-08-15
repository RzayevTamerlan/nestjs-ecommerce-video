import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CommentsDocument, CommentsModel } from './comments.model';
import { CommentsDto } from './dto/comments.dto';
import { UsersDocument } from '../users/users.model';
import { ProductsService } from '../products/products.service';
import { PRODUCT_NOT_FOUND } from '../products/products.constants';
import { UsersService } from '../users/users.service';
import { USER_NOT_FOUND } from '../auth/auth.constants';
import { COMMENT_MODEL_NAME, COMMENT_NOT_FOUND, USER_ALREADY_HAVE_COMMENT_ON_PRODUCT } from './comments.constants';
import { ProductsDocument } from '../products/products.model';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';
import { EditCommentDto } from './dto/edit-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(COMMENT_MODEL_NAME) private readonly commentsModel: Model<CommentsModel>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly productsService: ProductsService,
    private readonly usersService: UsersService,
  ) {
  }

  async createNewComment(dto: CommentsDto, user: UsersDocument) {
    const [product, userDb] = await Promise.all([
      await this.productsService.getProductById(dto.product),
      await this.usersService.findUserById(user._id),
    ]);

    if (!product) throw new NotFoundException(PRODUCT_NOT_FOUND);
    if (!userDb) throw new NotFoundException(USER_NOT_FOUND);

    product.comments.forEach((comment: CommentsDocument) => {
      if (comment.user._id === userDb._id) {
        throw new ConflictException(USER_ALREADY_HAVE_COMMENT_ON_PRODUCT);
      }
    });

    const newComment = new this.commentsModel({
      rating: dto.rating,
      user: userDb._id,
      product: product._id,
      content: dto.content,
    });

    const commentDb = await newComment.save();
    const idOfComments = product.comments.map(comment => comment._id);
    idOfComments.push(commentDb._id);
    const newRating = this.calculateRating(product, dto.rating);
    const newProduct = {
      ...product.toObject(),
      category: product.category._id,
      comments: idOfComments,
      rating: newRating,
    };
    const { _id, ...productWithoutId } = newProduct;

    return await this.productsService.updateProduct(product._id, productWithoutId);
  }

  calculateRating(product: ProductsDocument, rating: number) {
    return (product.rating + rating) / (product.comments.length + 1);
  }

  async editComment(dto: EditCommentDto, id: Types.ObjectId, user: UsersDocument) {
    const comment = await this.commentsModel.findById(id)
      .populate('user', '-passwordHash')
      .populate('product')
      .exec();

    if (!comment) throw new NotFoundException(COMMENT_NOT_FOUND);

    if (comment.user._id.toString() !== user._id.toString()) {
      throw new ConflictException('You can edit only your comments');
    }

    const product = await this.productsService.getProductById(comment.product._id);
    const newRating = this.calculateRating(product, dto.rating);

    const newProduct = {
      ...product.toObject(),
      rating: newRating,
    };

    const { _id, ...productWithoutId } = newProduct;

    const newComment = {
      ...dto,
      product: comment.product._id,
      user: user._id,
    };

    await this.productsService.updateProduct(product._id, productWithoutId);
    return await this.commentsModel.findByIdAndUpdate(id, newComment, { new: true }).exec();
  }

  async deleteComment(id: Types.ObjectId, user: UsersDocument) {
    const comment = await this.commentsModel.findById(id)
      .populate('user')
      .populate('product')
      .exec();

    if (!comment) throw new NotFoundException(COMMENT_NOT_FOUND);

    if (comment.user._id.toString() !== user._id.toString()) {
      throw new ConflictException('You can delete only your comments');
    }

    const product = await this.productsService.getProductById(comment.product._id);
    const newRating = this.calculateRating(product, -comment.rating);
    const newProduct = {
      ...product.toObject(),
      rating: newRating,
    };
    const { _id, ...productWithoutId } = newProduct;

    await Promise.all([
      this.productsService.updateProduct(product._id, productWithoutId),
      this.commentsModel.findByIdAndDelete(id).exec(),
    ]);

    return null;
  }

  async getAllComments(dto: GetAllCommentsDto) {
    const cacheKey = `comments-${dto.page}-${dto.limit}-${dto.sort}`;
    const cachedComments = await this.cacheManager.get(cacheKey);
    if (cachedComments) return cachedComments;

    const [comments, total] = await Promise.all([
      this.commentsModel.find(dto)
        .populate('user')
        .populate('product')
        .sort(dto.sort)
        .skip(dto.page * dto.limit)
        .limit(dto.limit)
        .exec(),
      this.commentsModel.countDocuments().exec(),
    ]);

    const totalPages = Math.ceil(total / dto.limit);
    const result = {
      totalPages,
      perPage: dto.limit,
      currentPage: dto.page,
      total,
      data: comments,
    };

    await this.cacheManager.set(cacheKey, result, 60 * 5 * 1000);
    return result;
  }

  async findCommentById(id: Types.ObjectId) {
    const cacheKey = `comment-${id}`;
    const cachedComment = await this.cacheManager.get(cacheKey);
    if (cachedComment) return cachedComment;

    return await this.commentsModel.findById(id).exec();
  }


}
