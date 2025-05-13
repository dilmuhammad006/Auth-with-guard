import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos';
import { Protected, Roles } from 'src/decorators';
import { ApiOperation } from '@nestjs/swagger';
import { UserRoles } from './enums';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @ApiOperation({ summary: 'Register' })
  @Protected(false)
  @Roles([UserRoles.ALL])
  @Post('sign-up')
  async Register(@Body() payload: RegisterDto) {
    return this.service.register(payload);
  }

  @ApiOperation({ summary: 'Login' })
  @Protected(false)
  @Roles([UserRoles.ALL])
  @Post('sign-in')
  async Login(@Body() payload: LoginDto) {
    return this.service.login(payload);
  }
}
