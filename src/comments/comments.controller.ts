import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put, Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CommentsDto } from './dto/comments.dto';
import { IRequestWithUser } from '../common/interfaces/IRequestWithUser.interface';
import { EditCommentDto } from './dto/edit-comment.dto';
import { IdDto } from '../common/dto/id.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetAllCommentsDto } from './dto/get-all-comments.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
  ) {
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async createNewComment(@Body() dto: CommentsDto, @Req() req: IRequestWithUser) {
    return await this.commentsService.createNewComment(dto, req.user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async editComment(@Body() dto: EditCommentDto, @Param() params: IdDto, @Req() req: IRequestWithUser) {
    return await this.commentsService.editComment(dto, params.id, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  async deleteComment(@Param() params: IdDto, @Req() req: IRequestWithUser) {
    return await this.commentsService.deleteComment(params.id, req.user);
  }

  @Get('')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe({transform: true}))
  async getAllComments(@Query() dto: GetAllCommentsDto) {
    return await this.commentsService.getAllComments(dto)
  }
}
