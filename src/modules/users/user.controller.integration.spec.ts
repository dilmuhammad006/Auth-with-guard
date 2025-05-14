import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { fsHelper } from '@helpers';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models';
import { CreateUserDtoRequest, UpdateUserDtoRequest } from './dtos';
import { NotFoundException } from '@nestjs/common';

describe('Usercontroller', () => {
  let controller: UserController;
  let fs: fsHelper;
  beforeAll(async () => {
    const moduleMixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST,
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          logging: console.log,
          sync: {
            alter: true,
          },
          autoLoadModels: true,
        }),
        SequelizeModule.forFeature([User]),
      ],
      controllers: [UserController],
      providers: [UserService, fsHelper],
    }).compile();

    controller = moduleMixture.get<UserController>(UserController);
    fs = moduleMixture.get<fsHelper>(fsHelper);
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });
  afterEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await User.sequelize?.close();
  });

  it('Get all users controller', async () => {
    const user: CreateUserDtoRequest = {
      name: 'test',
      age: 19,
      email: 'test@gmail.com',
      password: 'test123',
    };

    let file: Express.Multer.File = 'file.mpeg' as any;

    await controller.createUser(user, file);

    const res = await controller.getAllUsers({ limit: 1, page: 1 });

    expect(res.count).toBe(1);
  });

  it('create user controller', async () => {
    const user: CreateUserDtoRequest = {
      name: 'test',
      age: 19,
      email: 'test@gmail.com',
      password: 'test123',
    };

    const file: Express.Multer.File = {
      buffer: Buffer.from(''),
      originalname: 'jpeg.mpeg',
      mimetype: 'image/mpeg',
      fieldname: 'rasm',
      size: 15,
    } as any;

    const res = await controller.createUser(user, file);

    console.log(res.data);
    expect(res.message).toEqual('success');
    expect(res.data).toBeInstanceOf(Object);
    expect(res.data.dataValues.name).toEqual(user.name);
    expect(res.data.dataValues.age).toEqual(user.age);
    expect(res.data.dataValues.email).toEqual(user.email);
    expect(res.data.dataValues.password.length).toBeGreaterThanOrEqual(10);
    expect(res.data.dataValues.password).not.toEqual(user.password);
  });

  it('get user by id controller', async () => {
    const id: number = 1;

    try {
      const res = await controller.getUserById(id);
      expect(res.message).toBeDefined();
      expect(res.message).toEqual('success');
      expect(res.data).toBeDefined();
      expect(res.data.dataValues).toHaveProperty('id');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe('User not found with given ID');
    }
  });
  it('delete user by id controller', async () => {
    const id: number = 1;

    try {
      const res = await controller.deleteUser(id);
      expect(res.message).toBeDefined();
      expect(res.message).toEqual('success');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(
        'User not foud with given ID or already deleted!',
      );
    }
  });

  it('update user info controller', async () => {
    const id: number = 1;
    const user: UpdateUserDtoRequest = {
      name: 'test',
      password: '123456',
      age: 12,
    };

    try {
      const res = await controller.updateUser(user, id);

      expect(res.message).toBeDefined();
      expect(res.message).toBe('success');
      expect(res.data?.dataValues.name).toEqual(user.name);
      expect(res.data?.dataValues.password).toEqual(user.password);
      expect(res.data?.dataValues.age).toEqual(user.age);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(
        'User not foud with given ID or already deleted!',
      );
    }
  });

  it('update user image controller', async () => {
    const id: number = 1;

    const file: Express.Multer.File = {
      buffer: Buffer.from(''),
      originalname: 'jpeg.mpeg',
      mimetype: 'image/mpeg',
      fieldname: 'rasm',
      size: 15,
    } as any;

    try {
      const res = await controller.UpdateImage(id, file);

      const image = await fs.uploadFile(file);
      await fs.unlinkFile(file.originalname);

      expect(res.message).toBeDefined();
      expect(res.message).toBe('success');
      expect(res.data?.dataValues).toHaveProperty('id');
      expect(res.data?.dataValues).toHaveProperty('image');
      expect(res.data?.dataValues).toHaveProperty('name');
      expect(image.fileUrl).toBeDefined();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(
        'User not foud with given ID or already deleted!',
      );
    }
  });
});
2;
