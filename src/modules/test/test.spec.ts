import { BadRequestException } from '@nestjs/common';
import divide from './test';

describe('Divide function', () => {
  it('Divide 4 to the 2', () => {
    const res = divide(4, 2);

    expect(res).toBe(2);
  });

  test('Divide number to zero', () => {
    try {
      divide(4, 0);
    } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Second number must be greater than 0')
    }
  });
});
