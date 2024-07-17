import { Controller, Get, HttpCode, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MFile } from './mfile.class';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('upload')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const saveFiles: MFile[] = [file];

    if (file?.mimetype.includes('image')) {
      const webP = await this.fileService.convertToWebP(file.buffer);
      saveFiles.push(new MFile({ originalname: `${file.originalname.split('.')[0]}.webp`, buffer: webP }));
    }

    return this.fileService.saveFiles(saveFiles, 'products');
  }

  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('images')
  async getImages() {
    return await this.fileService.getImages('products');
  }
}
