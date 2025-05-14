import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../src/app.module';

describe('App 2e2', () => {
  let app: INestApplication;
  let sequelize: Sequelize;

  beforeAll(async () => {
    const moduleMixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleMixture.createNestApplication();
    await app.init();

    sequelize = moduleMixture.get(Sequelize);
  });

  afterAll(async () => {
    await app.close();
    await sequelize.close();
  });

  it('should be defined', async () => {
    expect(app).toBeDefined();
  });

  it('Db connection', async () => {
    const res = await sequelize.authenticate();

    expect(res).toBeDefined();
  });
});