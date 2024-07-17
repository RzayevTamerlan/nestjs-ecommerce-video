import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CATEGORY_MODEL_NAME } from './categories.constants';
import { CategoriesSchema } from './categories.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CATEGORY_MODEL_NAME, schema: CategoriesSchema },
    ]),
  ],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
