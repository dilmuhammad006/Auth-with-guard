import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models';
import { fsHelper } from '@helpers';
import { CreateUserDtoRequest, UpdateUserDtoRequest } from './dtos';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UserService integration', () => {
  let service: UserService;
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
      providers: [UserService, fsHelper],
    }).compile();

    service = moduleMixture.get<UserService>(UserService);
    fs = moduleMixture.get<fsHelper>(fsHelper);
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  afterAll(async () => {
    await User.sequelize?.close();
  });

  it('Get all users (Integration)', async () => {
    const user: CreateUserDtoRequest = {
      name: 'test',
      age: 19,
      email: 'test@gmail.com',
      password: 'test123',
    };

    let file: Express.Multer.File = 'file.mpeg' as any;
    await service.creatUser(user, file);

    const res = await service.getAllUsers({ page: 1, limit: 1 });

    expect(res.count).toEqual(1);
    expect(res.data).toHaveLength(1);
    expect(res.data[0]).toHaveProperty('id');
  });

  it('create', async () => {
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
    try {
      const image = await fs.uploadFile(file);
      await service.creatUser(user, file);
      await service.creatUser(user, file);
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toEqual('User with this email is already exists');
    }
  });
  it('get user by id', async () => {
    const id: number = 1;

    try {
      const res = await service.getUserById(id);

      expect(res.data).toBeInstanceOf(Object);
      expect(res.message).toEqual('success');
      expect(res.data).toHaveProperty('id');
      expect(res.data).toBeTruthy();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual('User not found with given ID');
    }
  });

  it('delete user with id', async () => {
    const id: number = 1;

    try {
      const res = await service.deleteUser(id);

      expect(res.message).toEqual('success');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(
        'User not foud with given ID or already deleted!',
      );
    }
  });

  it('update user', async () => {
    const id: number = 1;
    const user: UpdateUserDtoRequest = {
      name: 'john',
      password: '123456',
      age: 20,
    };

    try {
      const res = await service.updateUser(user, id);

      expect(res.message).toEqual('success');
      expect(res.data).toBeInstanceOf(Object);
      expect(res.data?.name).toEqual(user.name);
      expect(res.data).toEqual(user);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toBe(
        'User not foud with given ID or already deleted!',
      );
    }
  });

  it('update user image', async () => {
    const id: number = 1;

    const file: Express.Multer.File = {
      buffer: Buffer.from(''),
      originalname: 'jpeg.mpeg',
      mimetype: 'image/mpeg',
      fieldname: 'rasm',
      size: 15,
    } as any;

    try {
      const res = await service.updateImage(id, file);

      const image = fs.uploadFile(file);
      await fs.unlinkFile(file.originalname);
      expect(res.message).toEqual('success');
      expect(res.data).toBeInstanceOf(Object);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      expect(error.message).toEqual(
        'User not foud with given ID or already deleted!',
      );
    }
  });
});
