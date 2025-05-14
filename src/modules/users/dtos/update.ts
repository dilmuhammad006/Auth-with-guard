import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUserDtoRequest {
  @ApiProperty({
    type: 'string',
    format: 'string',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    type: 'string',
    format: 'string',
    example: 'john123',
    required: false,
  })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({
    type: 'number',
    format: 'number',
    example: 18,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsInt()
  age?: number;
}
