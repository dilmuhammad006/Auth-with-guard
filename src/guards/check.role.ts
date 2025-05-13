import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/decorators';
import { UserRoles } from 'src/modules';

@Injectable()
export class CheckRole implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<
      Request & { role?: UserRoles; userId?: string }
    >();

    const roles = this.reflector.getAllAndOverride<UserRoles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    let userRole = request.role;
    if (roles.includes(UserRoles.ALL)) {
      return true;
    }

    if (!roles || !userRole || !roles.includes(userRole)) {
      throw new ForbiddenException(
        `You don't have any access for this operation`,
      );
    }

    return true;
  }
}
