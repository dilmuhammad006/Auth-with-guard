import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models';
import {
  CreateUserDtoRequest,
  GetAllUsersDtoRequest,
  UpdateUserDtoRequest,
} from './dtos';
import { UserRoles } from './enums';
import * as bcrypt from 'bcryptjs';
import { fsHelper } from '@helpers';
import * as path from 'path';
import * as fs from 'fs';
import { Op } from 'sequelize';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly fs: fsHelper,
  ) {}

  async onModuleInit() {
    try {
      await this.#seedSuperAdmin();
      await this.fs.MkdirUploads();
      console.log('✅');
    } catch (error) {
      console.log(error.message);
    }
  }

  async getAllUsers(payload: GetAllUsersDtoRequest) {
    const offset = (payload.page - 1) * payload.limit;
    let filters: any = {};

    if (payload.minAge) {
      filters.age = {
        [Op.gte]: payload.minAge,
      };
    }

    if (payload.maxAge) {
      filters.age = {
        ...filters?.age,
        [Op.lte]: payload.maxAge,
      };
    }

    if (payload.role) {
      filters.role = {
        [Op.eq]: payload.role,
      };
    }

    const { count, rows: users } = await this.userModel.findAndCountAll({
      limit: payload.limit || 10,
      offset: offset || 0,
      order: [[payload.sortField || 'id', payload.sortOrder || 'ASC']],
      where: { ...filters },
      attributes: payload.fileds,
    });

    return {
      message: 'succes',
      page: payload.page || 1,
      totalCount: count,
      count: users.length,
      data: users,
    };
  }

  async getUserById(id: number) {
    const founded = await this.userModel.findByPk(id);

    if (!founded) {
      throw new NotFoundException('User not found with given ID');
    }

    return {
      message: 'success',
      data: founded,
    };
  }

  async creatUser(payload: CreateUserDtoRequest, file: Express.Multer.File) {
    const founded = await this.userModel.findOne({
      where: { email: payload.email },
    });

    if (founded) {
      throw new ConflictException('User with this email is already exists');
    }

    const image = await this.fs.uploadFile(file);

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.userModel.create({
      name: payload.name,
      email: payload.email,
      age: payload.age,
      password: hashedPassword,
      // image: image.fileUrl,
    });

    return {
      message: 'success',
      data: user,
    };
  }

  async deleteUser(id: number) {
    const founded = await this.userModel.findByPk(id);
    if (!founded) {
      throw new NotFoundException(
        'User not foud with given ID or already deleted!',
      );
    }

    const image = founded.dataValues.image;
    if (fs.existsSync(path.join(process.cwd(), 'uploads', image))) {
      await this.fs.unlinkFile(image);
    }

    await this.userModel.destroy({ where: { id: id } });

    return {
      message: 'success',
    };
  }

  async updateImage(id: number, file: Express.Multer.File) {
    const founded = await this.userModel.findByPk(id);
    if (!founded) {
      throw new NotFoundException(
        'User not foud with given ID or already deleted!',
      );
    }
    const image = founded.dataValues.image;
    if (image && fs.existsSync(path.join(process.cwd(), 'uploads', image))) {
      await this.fs.unlinkFile(image);
    }

    const newImage = await this.fs.uploadFile(file);

    await this.userModel.update(
      { image: newImage.fileUrl },
      { where: { id: id } },
    );

    const user = await this.userModel.findByPk(id);

    return {
      message: 'success',
      data: user,
    };
  }

  async updateUser(payload: UpdateUserDtoRequest, id: number) {
    const founded = await this.userModel.findByPk(id);
    if (!founded) {
      throw new NotFoundException(
        'User not foud with given ID or already deleted!',
      );
    }

    if (payload.password) {
      const hashedPassword = await bcrypt.hash(payload.password, 10);
      await this.userModel.update(
        {
          name: payload.name || founded.dataValues.name,
          password: hashedPassword,
          age: payload.age || founded.dataValues.name,
        },
        { where: { id: id } },
      );
    }
    await this.userModel.update(
      {
        name: payload.name || founded.dataValues.name,
        age: payload.age || founded.dataValues.age,
      },
      { where: { id: id } },
    );

    const user = await this.userModel.findByPk(id);
    return {
      message: 'success',
      data: user,
    };
  }

  async #seedSuperAdmin() {
    try {
      const SuperAdmin = [
        {
          name: 'Dilmuhammad',
          email: 'dilmuhammadabdumalikov06@gmail.com',
          password: '20060524',
          role: UserRoles.SUPER_ADMIN,
          age: 19,
        },
      ];

      for (let u of SuperAdmin) {
        const user = await this.userModel.findOne({
          where: { email: u.email },
        });

        if (!user) {
          const hashedPassword = await bcrypt.hash(u.password, 10);

          await this.userModel.create({
            name: u.name,
            email: u.email,
            password: hashedPassword,
            role: u.role,
            age: 19,
          });
        }
      }
      console.log('✅');
    } catch (error) {
      console.log(error.message);
    }
  }
}
