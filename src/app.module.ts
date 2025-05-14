import { CheckAuth, CheckRole } from '@guards';
import { UserModule } from '@modules';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV?.trim() === 'test' ? '.env.test' : '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),

    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: false,
      sync: {
        alter: true,
      },
      autoLoadModels: true,
    }),
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CheckAuth,
    },
    {
      provide: APP_GUARD,
      useClass: CheckRole,
    },
  ],
})
export class AppModule {}
