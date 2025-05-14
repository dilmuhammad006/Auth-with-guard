import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { sortField, sortOrder, UserRoles } from '../enums';
import { BadRequestException } from '@nestjs/common';

const accepetFields = [
  'id',
  'name',
  'email',
  'age',
  'role',
  'password',
  'createdAt',
  'updatedAt',
  'image',
];

export class GetAllUsersDtoRequest {
  @ApiProperty({
    type: 'number',
    required: false,
    example: 1,
  })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsInt()
  @IsPositive()
  page:number;

  @ApiProperty({
    type: 'number',
    required: false,
    example: 1,
  })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsInt()
  @IsPositive()
  limit: number;

  @ApiProperty({
    type: 'string',
    enum: sortOrder,
    default: sortOrder.ASC,
    example: sortOrder.ASC,
    required: false,
  })
  @IsString()
  @IsOptional()
  sortOrder?: sortOrder;

  @ApiProperty({
    type: 'string',
    enum: sortField,
    default: sortField.id,
    example: sortField.id,
    required: false,
  })
  @IsString()
  @IsOptional()
  sortField?: sortField;

  @ApiProperty({
    type: 'number',
    required: false,
    example: 18,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsPositive()
  @Min(18)
  minAge?: number;

  @ApiProperty({
    type: 'number',
    required: false,
    example: 80,
  })
  @IsOptional()
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsPositive()
  @Max(80)
  maxAge?: number;

  @ApiProperty({
    type: 'string',
    enum: UserRoles,
    default: UserRoles.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRoles)
  role?: UserRoles;

  @ApiProperty({
    type: 'string',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value.length) return accepetFields;
    else {
      const values: string[] = value.split(',');
      const isValid = values.every((el) => accepetFields.includes(el));
      if (!isValid) throw new BadRequestException('Incorrect row sended');
      return false;
    }
  })
  fileds?: string[];
}
