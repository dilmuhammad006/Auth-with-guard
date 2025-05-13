import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class checkFileSize implements PipeTransform {
  constructor(private readonly size: number) {}
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (file.size >= this.size) {
      throw new BadRequestException(
        `${file.originalname} size must be less than ${(this.size / 1024 / 1024).toFixed(2)}`,
      );
    }

    return file;
  }
}
