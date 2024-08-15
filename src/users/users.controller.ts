import { Body, Controller, Patch, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { IRequestWithUser } from '../common/interfaces/IRequestWithUser.interface';
import { WishlistDto } from './dto/wishlist.dto';

@Controller('users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService
  ) {
  }

  @Patch('wish-list-add')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async addProductToWishList(@Req() req: IRequestWithUser, @Body() dto: WishlistDto) {
    return await this.usersService.addProductToWishList(dto, req.user);
  }

  @Patch('wish-list-remove')
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  async removeProductFromWishList(@Req() req: IRequestWithUser, @Body() dto: WishlistDto) {
    return await this.usersService.removeProductFromWishList(dto, req.user);
  }
}
