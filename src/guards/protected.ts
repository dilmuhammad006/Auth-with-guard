import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PROTECTED_KEY } from '../decorators/protected';
import { UserRoles } from '../modules/users/enums/user.role';

@Injectable()
export class CheckAuth implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isProtected = this.reflector.getAllAndOverride<boolean>(
      PROTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<
      Request & { role?: string; userId?: string }
    >();

    if (!isProtected) {
      request.role = UserRoles.USER;
      return true;
    }

    const token = request.headers['authorization'];

    if (!token || !token.startsWith('Bearer')) {
      throw new BadRequestException('Plese try again with token');
    }

    const AccesToken = token.split('Bearer')[1].trim();

    if (!AccesToken) {
      throw new BadRequestException('Try again with Acces token');
    }

    try {
      const data = this.jwt.verify(AccesToken);
      request.userId = data?.id;
      request.role = data?.role;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ForbiddenException('Error token');
      } else if (error instanceof JsonWebTokenError) {
        throw new ConflictException('Error format for token');
      } else {
        throw new InternalServerErrorException('Interal Server Error');
      }
    }
  }
}
