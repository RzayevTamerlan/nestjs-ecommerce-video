import { Body, Controller, Get, Patch, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BasketService } from './basket.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IRequestWithUser } from '../common/interfaces/IRequestWithUser.interface';
import { AddBasketDto } from './dto/add-basket.dto';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('basket')
export class BasketController {
  constructor(
    private readonly basketService: BasketService
  ) {
  }

  @Patch('add')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async addProductToBasket(@Body() dto: AddBasketDto, @Req() req: IRequestWithUser) {
    return await this.basketService.addProductToBasket(dto, req.user);
  }

  @Patch('remove')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async removeProductFromBasket(@Body() dto: AddBasketDto, @Req() req: IRequestWithUser) {
    return await this.basketService.removeProductFromBasket(dto, req.user);
  }

  @Patch('clear')
  @UseGuards(JwtAuthGuard)
  async clearBasket(@Req() req: IRequestWithUser) {
    return await this.basketService.clearBasket(req.user);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Req() req: IRequestWithUser, @Body() dto: CheckoutDto) {
    return await this.basketService.checkout(req.user, dto);
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getBasket(@Req() req: IRequestWithUser) {
    return await this.basketService.getBasket(req.user);
  }
}