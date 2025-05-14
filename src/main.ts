import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'v',
  });

  app.enableCors({
    allowHeaders: ['Authorization'],
    methods: ['*'],
    optionsSuccessStatus: 200,
    origin: process.env.CORS_ORIGIN,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter())

  const config = new DocumentBuilder()
    .setTitle('Users')
    .setDescription('CRUD for users')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const DocumentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, DocumentFactory);
  const port = process.env.APP_PORT || 2006;
  await app.listen(port, () => {
    console.log(`http://localhost:${port}`);
    console.log(`http://localhost:${port}/docs`);
  });
}
bootstrap();
