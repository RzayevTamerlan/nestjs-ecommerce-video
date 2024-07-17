import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { GetAllProductsDto } from './dto/get-all-products.dto';
import { GetProductDto } from './dto/get-product.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {
  }

  @Get('')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getAllProducts(@Query() query: GetAllProductsDto) {
    return await this.productsService.getAllProducts(query);
  }

  @Get(':id')
  @UsePipes(new ValidationPipe())
  async getProductById(@Param() params: GetProductDto) {
    return await this.productsService.getProductById(params.id);
  }

  @Post('')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({transform: true}))
  async createProduct(@Body() product: ProductDto) {
    return await this.productsService.createProduct(product);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateProduct(@Param() params: UpdateProductDto, @Body() product: ProductDto) {
    return await this.productsService.updateProduct(params.id, product);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deleteProduct(@Param() params: DeleteProductDto) {
    return await this.productsService.deleteProduct(params.id);
  }
}
