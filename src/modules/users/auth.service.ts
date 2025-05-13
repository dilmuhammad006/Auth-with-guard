import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models';
import { LoginDto, RegisterDto } from './dtos';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwt: JwtService,
  ) {}

  async register(payload: RegisterDto) {
    await this.#_checkExisting(payload.email);

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    const user = await this.userModel.create({
      email: payload.email,
      name: payload.email,
      password: hashedPassword,
    });

    const userRole = user.dataValues.role;
    const AccesToken = this.jwt.sign({
      id: user.id,
      role: userRole,
    });

    return {
      message: 'success',
      data: { tokens: AccesToken, user },
    };
  }
  async login(payload: LoginDto) {
    const user = await this.#_checkUserEmail(payload.email);

    const isMatch = bcrypt.compareSync(
      payload.password,
      user.dataValues.password,
    );

    if (!isMatch) {
      throw new ConflictException('Incorrect password');
    }

    const userRole = user.dataValues.role;
    const AccesToken = this.jwt.sign({
      id: user.id,
      role: userRole,
    });

    return {
      message: 'succes',
      data: {
        tokens: AccesToken,
        user,
      },
    };
  }
  async #_checkExisting(email: string) {
    const user = await this.userModel.findOne({ where: { email: email } });
    if (user) {
      throw new ConflictException('This user already exists');
    }
  }
  async #_checkUserEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email: email } });

    if (!user) {
      throw new ConflictException('User not found');
    }

    return user;
  }
}
