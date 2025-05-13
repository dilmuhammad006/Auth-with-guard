import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    type: 'string',
    format: 'string',
    example: 'john@gmail.com',
    required: true,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'string',
    format: 'string',
    example: 'john123',
    required: true,
  })
  @IsString()
  password: string;
}
