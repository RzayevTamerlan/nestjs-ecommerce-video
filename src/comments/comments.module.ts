import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COMMENT_MODEL_NAME } from './comments.constants';
import { CommentsSchema } from './comments.model';
import { ProductsModule } from '../products/products.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COMMENT_MODEL_NAME, schema: CommentsSchema },
    ]),
    ProductsModule,
    UsersModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {
}
