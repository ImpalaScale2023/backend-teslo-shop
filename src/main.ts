import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  //Swagger para documentar
  const config = new DocumentBuilder()
    .setTitle('TesLo restFUL Api')
    .setDescription('Teslo shop endpoints')
    .setVersion('1.0')
//    .addTag('cats')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);
  //

  await app.listen(process.env.PORT ?? 3000);
  logger.log(`App running on port ${ process.env.PORT}`);
}
bootstrap();
