import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsInt, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    type: 'string',
    format: 'string',
    example: 'John',
    required: true,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'number',
    format: 'number',
    example: 18,
    required: true,
  })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsInt()
  age: number;

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
