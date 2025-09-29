import { join } from 'path';  
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';


@Module({
  imports: [ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities : true,
      synchronize: true, //Setting synchronize: true shouldn't be used in production - otherwise you can lose production data.
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    ProductsModule,
    CommonModule,
    SeedModule,
    FilesModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
