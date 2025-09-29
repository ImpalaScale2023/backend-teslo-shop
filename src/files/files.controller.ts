import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res  } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { fileNamer } from './helpers/fileNamer.helper';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
            private readonly configService : ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,  //hace que nosotros tengamos el control de retuyn
    @Param('imageName') imageName:string
  ){

    const  path = this.filesService.getStaticProductImage(imageName);

    return res.sendFile(path);
    // return res.status(403).json({
    //   ok:false,
    //   path:path
    // }

    // )
  }
  
  
  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    //limits:{fileSize:1000}
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    }
    )
  }))
  uploadProductImage(
    @UploadedFile() file: Express.Multer.File,

  ) {

    if (!file) {
      throw new BadRequestException('Make suer that the file is an image.');
    }
    
    // const secureUrl = `${ file.filename}` ;
    const secureUrl = `${ this.configService.get('HOST_API')}/files/product/${file.filename}`;

    return { secureUrl}

  }

}
