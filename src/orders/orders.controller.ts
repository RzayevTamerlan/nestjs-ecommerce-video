import { Controller, Get, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IRequestWithUser } from '../common/interfaces/IRequestWithUser.interface';
import { GetOrdersDto } from './dto/get-orders.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IdDto } from '../common/dto/id.dto';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {
  }

  @Get('/my-orders')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async getMyOrders(@Req() req: IRequestWithUser, @Query() query: GetOrdersDto) {
    return await this.ordersService.getMyOrders(req.user, query);
  }

  @Get('/')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  async getOrders(@Query() query: GetOrdersDto) {
    return await this.ordersService.getOrders(query);
  }

  @Get('/order')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async getOrder(@Req() req: IRequestWithUser, @Query() query: IdDto) {
    return await this.ordersService.getOrder(req.user, query.id);
  }
}
