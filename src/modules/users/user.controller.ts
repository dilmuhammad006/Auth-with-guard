import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDtoRequest,
  GetAllUsersDtoRequest,
  UpdateImageDto,
  UpdateUserDtoRequest,
} from './dtos';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { checkFileMimeType, checkFileSize } from 'src/pipes';
import { Protected, Roles } from 'src/decorators';
import { UserRoles } from './enums';

@Controller({ path: 'users', version: ['2'] })
export class UserController {
  constructor(private readonly service: UserService) {}

  @ApiBearerAuth()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get all users' })
  @Get()
  async getAllUsers(@Query() query: GetAllUsersDtoRequest) {
    return this.service.getAllUsers(query);
  }

  @ApiBearerAuth()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @ApiOperation({ summary: 'Get User by ID' })
  @Get(':id')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.service.getUserById(id);
  }

  @ApiBearerAuth()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @ApiOperation({ summary: 'Create User with image' })
  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createUser(
    @Body() body: CreateUserDtoRequest,
    @UploadedFile(
      new checkFileSize(5 * 1024 * 1024),
      new checkFileMimeType(['jpeg', 'mpeg', 'png', 'jfif']),
    )
    file: Express.Multer.File,
  ) {
    return this.service.creatUser(body, file);
  }

  @ApiBearerAuth()
  @Protected(true)
  @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
  @ApiOperation({ summary: 'Delete user with ID' })
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.service.deleteUser(id);
  }

  @ApiBearerAuth()
  @Protected(true)
  @Roles([UserRoles.ALL])
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update user image' })
  @ApiBody({
    description: 'Image file',
    type: UpdateImageDto,
  })
  @Put('image/:id')
  async UpdateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile(
      new checkFileSize(5 * 1024 * 1024),
      new checkFileMimeType(['jpeg', 'mpeg', 'png', 'jfif']),
    )
    file: Express.Multer.File,
  ) {
    return await this.service.updateImage(id, file);
  }

  @ApiBearerAuth()
  @Protected(true)
  @Roles([UserRoles.ALL])
  @ApiOperation({ summary: `Update users's informatins` })
  @Patch(':id')
  async updateUser(
    @Body() body: UpdateUserDtoRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.updateUser(body, id);
  }
}
