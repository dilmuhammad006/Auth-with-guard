import { BadRequestException } from '@nestjs/common';

function divide(num1: number, num2: number): number {
  if (num2 < 1)
    throw new BadRequestException('Second number must be greater than 0');
  return num1 / num2;
}
export default divide;
