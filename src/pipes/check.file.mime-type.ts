import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class checkFileMimeType implements PipeTransform {
  constructor(private readonly mimeTypes: string[]) {}
  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!this.mimeTypes.includes(file.originalname.split('.')[1])) {
      throw new BadRequestException(
        `${file.originalname}'s format not suitable for ${this.mimeTypes}`,
      );
    }
    return file;
  }
}
