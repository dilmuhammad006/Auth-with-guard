import { INestApplication, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateUserDtoRequest,
  GetAllUsersDtoRequest,
  UpdateUserDtoRequest,
  User,
  UserModule,
} from '@users';
import * as path from 'path';
import { send } from 'process';
import { Sequelize } from 'sequelize-typescript';
import * as request from 'supertest';
describe('User - 2e2', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

  beforeAll(async () => {
    const moduleMixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST,
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          sync: {
            alter: true,
          },
          autoLoadModels: true,
        }),
        SequelizeModule.forFeature([User]),
        UserModule,
      ],
    }).compile();

    app = moduleMixture.createNestApplication();
    await app.init();

    sequelize = app.get<Sequelize>(Sequelize);
  });

  beforeEach(async () => {
    await User.destroy({ where: {}, cascade: true, truncate: true });
  });

  afterEach(async () => {
    await User.destroy({ where: {}, cascade: true, truncate: true });
  });

  afterAll(async () => {
    await User.sequelize?.close();
    await sequelize.close();
    await app.close();
  });

  it('GET /users - should get all users', async () => {
    const query: GetAllUsersDtoRequest = {
      limit: 1,
      page: 1,
    };

    const res = await request(app.getHttpServer())
      .get('/users')
      .send(query)
      .expect(200);

    expect(res.body).toMatchObject({
      message: 'succes',
    });
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('page');
  });

  it('GET /users/:id - should get user with given ID', async () => {
    const created = await User.create({
      name: 'test',
      age: 25,
      email: 'test@example.com',
      password: 'hashedpassword',
      image: 'test.jpg',
    });

    const res = await request(app.getHttpServer())
      .get(`/users/${created.id}`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body).toMatchObject({
      message: 'success',
    });

    expect(res.body).toHaveProperty('data');
  });

  it('GET /users/:id - should not found with given ID', async () => {
    const id: number = 99999999;
    const res = await request(app.getHttpServer())
      .get(`/users/${id}`)
      .expect(404);
    expect(res.body).toBeDefined();
    expect(res.body.message).toBe('User not found with given ID');
  });

  it('POST /users  - should create user', async () => {
    const users: CreateUserDtoRequest = {
      name: 'test',
      email: 'test@gmail.com',
      age: 19,
      password: 'aksjbkajsdb',
    };

    const imagePath = path.join(process.cwd(), 'test', 'test-img', 'car.png');

    const res = await request(app.getHttpServer())
      .post('/users')
      .field('name', users.name)
      .field('age', users.age.toString())
      .field('email', users.email)
      .field('password', users.password)
      .attach('image', imagePath)
      .expect(201);

    expect(res.body).toBeDefined();
    expect(res.body.message).toEqual('success');
    expect(res.body.data).toBeDefined();
    expect(res.body.data.name).toEqual(users.name);
    expect(res.body.data.email).toEqual(users.email);
    expect(res.body.data.age).toEqual(users.age);
  });

  it('DELTE /delete/:id  -should delete user with given id', async () => {
    const created = await User.create({
      name: 'test',
      age: 25,
      email: 'test@gmail.com',
      password: '123456',
      image: 'test.png',
    });

    const res = await request(app.getHttpServer())
      .delete(`/users/${created.id}`)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.message).toEqual('success');
  });

  it('DELETE /delete/:id  - should not found delete user with given ID', async () => {
    const id: number = 89999999;

    const res = await request(app.getHttpServer())
      .delete(`/users/${id}`)
      .expect(404);

    expect(res.body).toBeDefined();
    expect(res.body.message).toEqual(
      'User not foud with given ID or already deleted!',
    );
  });
  it('PATCH /users/:id  - should update user info', async () => {
    const payload: UpdateUserDtoRequest = {
      name: 'test',
      age: 12,
      password: '123456',
    };

    const created = await User.create({
      name: 'test',
      email: 'test@gmail.com',
      password: '123456',
      age: 85,
      image: 'test.png',
    });

    const res = await request(app.getHttpServer())
      .patch(`/users/${created.id}`)
      .send(payload)
      .expect(200);

    expect(res.body).toBeDefined();
    expect(res.body.message).toEqual('success');
    expect(res.body.data.name).toEqual(payload.name);
    expect(res.body.data.age).toEqual(payload.age);
    expect(res.body.data.password).not.toEqual(payload.password);
  });
});
