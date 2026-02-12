import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { resolve, join, extname } from 'path';
import { existsSync, mkdirSync, unlink, writeFile } from 'fs';
import { config } from '../../config';

@Injectable()
export class FileService {
  private readonly base_url = config.BASE_API;
  async createFile(file: Express.Multer.File | any): Promise<string> {
    try {
      const ext = extname(file.originalname).toLowerCase();

      // Fayl nomini olish va noqulay belgilarni olib tashlash
      let originalName = file.originalname.split('.')[0];
      originalName = originalName.replace(/\s+/g, '_'); // bo'shliqlarni _ ga almashtirish
      originalName = originalName.replace(/[^a-zA-Z0-9-_]/g, ''); // maxsus belgilarni olib tashlash

      const file_name = `${originalName}__${v4()}${ext}`;
      const file_path = resolve(__dirname, '..', '..', '..', 'uploads');

      if (!existsSync(file_path)) mkdirSync(file_path, { recursive: true });

      await new Promise<void>((resolve, reject) => {
        writeFile(join(file_path, file_name), file.buffer, (err) => {
          if (err) reject(err);
          resolve();
        });
      });

      return `${this.base_url}/${file_name}`;
    } catch (error) {
      throw new BadRequestException(`Error on creating file: ${error}`);
    }
  }

  async deleteFile(file_url: string): Promise<void> {
    try {
      // URL dan fayl nomini olish (base_url qismini olib tashlash)
      const fileName = file_url.replace(`${this.base_url}/`, '');
      if (!fileName) {
        throw new BadRequestException(`Invalid file URL: ${file_url}`);
      }

      // uploads papkasidagi to‘liq path
      const filePath = resolve(
        __dirname,
        '..',
        '..',
        '..',
        'uploads',
        fileName,
      );

      // Fayl mavjudligini tekshirish
      if (!existsSync(filePath)) {
        // Fayl yo‘q bo‘lsa xato tashlash o‘rniga shunchaki qaytib ketish mumkin
        // yoki agar xato tashlamoqchi bo‘lsangiz:
        throw new NotFoundException(`File does not exist: ${file_url}`);
      }

      // Faylni o‘chirish
      await new Promise<void>((resolve, reject) => {
        unlink(filePath, (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    } catch (error) {
      throw new BadRequestException(`Error on deleting file: ${error}`);
    }
  }

  async existFile(file_name: any) {
    const file = file_name.replace(this.base_url, '');
    const file_path = resolve(__dirname, '..', '..', '..', 'uploads', file);
    if (existsSync(file_path)) {
      return true;
    } else {
      return false;
    }
  }
}
