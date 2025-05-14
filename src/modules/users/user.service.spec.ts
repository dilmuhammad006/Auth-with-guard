import { fsHelper } from '@helpers';
import { UserService } from './user.service';
import {
  CreateUserDtoRequest,
  GetAllUsersDtoRequest,
  UpdateUserDtoRequest,
} from './dtos';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';

describe('UserService unit test', () => {
  let service: UserService;
  let userModel: any = {
    findAndCountAll: jest.fn().mockResolvedValue({ count: 1, rows: [] }),
    create: jest.fn(),
  };
  let fsHelper: fsHelper = {
    uploadFile: jest.fn(),
    unlinkFile: jest.fn(),
    MkdirUploads: jest.fn(),
  };

  beforeEach(() => {
    service = new UserService(userModel, fsHelper);
  });

  it('service defined', () => {
    expect(service).toBeDefined();
  });

  it('getAll', async () => {
    const query: GetAllUsersDtoRequest = {
      limit: 5,
      page: 1,
    };
    const res = await service.getAllUsers(query);

    expect(res).toBeInstanceOf(Object);
    expect(res.count).toBe(0);
    expect(res.data).toEqual([]);
    expect(res.totalCount).toBe(1);
    expect(res.page).toEqual(1);
  });

  it('create ', async () => {
    const createUserDto: CreateUserDtoRequest = {
      age: 22,
      email: 'tomas@gmail.com',
      name: 'tomas',
      password: '1234560',
    };

    let file: any;
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    userModel.findOne = jest.fn().mockResolvedValue(undefined);
    userModel.create = jest
      .fn()
      .mockResolvedValue({ ...createUserDto, hashedPassword });

    const res = await service.creatUser(
      {
        ...createUserDto,
        password: hashedPassword,
      },
      file,
    );

    expect(res.message).toEqual('success');
    expect(res.data).toBeInstanceOf(Object);
    expect(res.data.name).toEqual(createUserDto.name);
    expect(res.data.email).toEqual(createUserDto.email);
    expect(res.data.age).toEqual(createUserDto.age);
    expect(res.data.password).toEqual(createUserDto.password);
  });

  it('get by id', async () => {
    const id: number = 1;

    const user = {
      id,
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      image: 'uploads/test.jpg',
    };
    userModel.findByPk = jest.fn().mockResolvedValue(user);

    const res = await service.getUserById(id);

    expect(res.message).toEqual('success');
    expect(res.data).toBeInstanceOf(Object);
    expect(res.data).toEqual(user);
    expect(res.data.name).toEqual(user.name);
    expect(res.data.email).toEqual(user.email);
    expect(res.data.age).toEqual(user.age);
    expect(res.data.image).toEqual(user.image);
  });

  it('delete user by given id', async () => {
    const id: number = 1;
    const user = {
      id,
      dataValues: {
        image: 'uploads/test.jpg',
      },
    };

    userModel.findByPk = jest.fn().mockResolvedValue(user);
    userModel.destroy = jest.fn().mockResolvedValue(id);
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    fsHelper.unlinkFile = jest.fn().mockResolvedValue(true);

    const res = await service.deleteUser(id);

    expect(res.message).toEqual('success');
  });

  it('update user informations', async () => {
    const id: number = 1;
    const user: UpdateUserDtoRequest = {
      age: 22,
      name: 'tomas',
      password: '1234560',
    };

    const hashedPassword = await bcrypt.hash(user.password, 10);

    const existingUser = {
      dataValues: {
        name: 'oldname',
        age: 20,
        password: 'oldpass',
      },
    };

    userModel.findByPk = jest
      .fn()
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce({
        id,
        name: user.name,
        age: user.age,
        password: hashedPassword,
      });

    userModel.update = jest.fn().mockResolvedValue([1]);

    const res = await service.updateUser(user, id);

    expect(res.message).toEqual('success');
    expect(res.data).toBeInstanceOf(Object);
    expect(res.data?.name).toEqual(user.name);
    expect(res.data?.age).toEqual(user.age);
  });
});
