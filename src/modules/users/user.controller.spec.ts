import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDtoRequest } from './dtos';
describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    getAllUsers: jest.fn().mockResolvedValue({ data: [], count: 0 }),
    getUserById: jest.fn().mockResolvedValue({ data: {}, message: 'success' }),
    creatUser: jest.fn().mockResolvedValue({ data: {}, message: 'success' }),
    deleteUser: jest.fn().mockResolvedValue({ message: 'success' }),
    updateImage: jest.fn().mockResolvedValue({ message: 'image updated' }),
    updateUser: jest.fn().mockResolvedValue({ data: {}, message: 'success' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it(' get all users', async () => {
    const result = await controller.getAllUsers({ limit: 10, page: 1 });
    expect(result).toEqual({ data: [], count: 0 });
    expect(service.getAllUsers).toHaveBeenCalled();
  });

  it(' get user by id', async () => {
    const result = await controller.getUserById(1);
    expect(result.message).toBe('success');
    expect(service.getUserById).toHaveBeenCalledWith(1);
  });

  it(' create a user', async () => {
    const dto: CreateUserDtoRequest = {
      name: 'Tomas',
      email: 'tomas@gmail.com',
      age: 25,
      password: '123456',
    };

    const file = {
      originalname: 'test.jpg',
      buffer: Buffer.from(''),
      mimetype: 'image/jpeg',
      size: 1000,
    } as Express.Multer.File;

    const result = await controller.createUser(dto, file);
    expect(result.message).toBe('success');
    expect(service.creatUser).toHaveBeenCalledWith(dto, file);
  });

  it(' delete user', async () => {
    const result = await controller.deleteUser(1);
    expect(result.message).toBe('success');
    expect(service.deleteUser).toHaveBeenCalledWith(1);
  });

  it("update user's info", async () => {
    const dto = {
      name: 'Updated Name',
      age: 30,
      password: 'newpass',
    };

    const result = await controller.updateUser(dto, 1);
    expect(result.message).toBe('success');
    expect(service.updateUser).toHaveBeenCalledWith(dto, 1);
  });
});
