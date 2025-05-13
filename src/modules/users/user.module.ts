import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models';
import { JwtModule } from '@nestjs/jwt';
import { fsHelper } from '@helpers';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: 'test-key',
      signOptions: {
        expiresIn: 6000,
      },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService, fsHelper],
})
export class UserModule {}
