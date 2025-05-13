import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as fsPromise from 'fs/promises';

@Injectable()
export class fsHelper {
  async MkdirUploads() {
    const fileFolder = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(fileFolder)) {
      fs.mkdirSync(fileFolder);
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const fileFolder = path.join(process.cwd(), 'uploads');
    const fileName = `${Date.now()}-file.${file.originalname.split('.')[1]}`;
    if (!fs.existsSync(fileFolder)) {
      fs.mkdirSync(fileFolder);
    }

    await fsPromise.writeFile(path.join(fileFolder, fileName), file.buffer);

    return {
      fileUrl: fileName,
    };
  }


  async unlinkFile(name: string) {
    const fileFolder = path.join(process.cwd(), 'uploads', name);
    await fsPromise.unlink(fileFolder);
  }
}
