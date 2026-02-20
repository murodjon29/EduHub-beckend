import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateAuthDto } from './dto/update.dto';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileService } from '../file/file.service';
import { JwtService } from '@nestjs/jwt';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';
import { Response } from 'express';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(LearningCenter)
    private learningCenterRepository: Repository<LearningCenter>,
    private readonly fileService: FileService,
    private readonly jwtService: JwtService,
    private readonly bcrypt: BcryptManage,
  ) {}

  // Ro'yxatdan o'tish
  async register(registerDto: RegisterDto, file?: Express.Multer.File | any) {
    const { name, email, password, phone } = registerDto;
    // Email unikal bo'lishi kerak
    if (await this.learningCenterRepository.findOne({ where: { email } }))
      throw new ConflictException('Bu email allaqachon mavjud');

    // Telefon raqami unikal bo'lishi kerak
    if (await this.learningCenterRepository.findOne({ where: { phone } }))
      throw new ConflictException('Bu telefon raqami allaqachon mavjud');

    // login unikal bo'lishi kerak
    if (
      await this.learningCenterRepository.findOne({
        where: { login: registerDto.login },
      })
    )
      throw new ConflictException('Bunday login allaqachon mavjud');

    // Faylni saqlash va URL olish
    let logoUrl;
    if (file) {
      logoUrl = await this.fileService.createFile(file);
    }
    // Parolni xeshlash
    const hashedPassword = await this.bcrypt.createBcryptPassword(password);
    // Ro'yxatdan o'tish
    const learningCenter = this.learningCenterRepository.create({
      ...registerDto,
      password: hashedPassword,
      image: logoUrl,
    });
    // Ma'lumotlarni bazaga saqlash
    await this.learningCenterRepository.save(learningCenter);
    // Natijani qaytarish
    return {
      status_code: 201,
      message: 'Registration successful',
      data: { id: learningCenter },
    };
  }

  // Kirish
  async login(loginDto: LoginDto, res: Response) {
    const { login, password } = loginDto;
    // Login va parolni tekshirish
    const learningCenter = await this.learningCenterRepository.findOne({
      where: { login },
    });
    if (!learningCenter) {
      throw new BadRequestException("Notog'ri login");
    }
    const isPasswordValid = await this.bcrypt.comparePassword(
      password,
      learningCenter.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Notog'ri parol");
    }
    // Agar hisob bloklangan bo'lsa, xatolik qaytarish
    if (learningCenter.is_blocked) {
      throw new BadRequestException(
        "Sizning hisobingiz bloklangan, iltimos administrator bilan bog'laning",
      );
    }
    // JWT token yaratish
    const payload = {
      id: learningCenter.id,
      login: learningCenter.login,
      role: learningCenter.role,
    };
    // Access token va refresh token yaratish
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    // Refresh token yaratish
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });
    // refresh tokenni cookie sifatida yozish
    await this.writeToCookie(refreshToken, res);
    // Token va foydalanuvchi ma'lumotlarini qaytarish
    return {
      status_code: 200,
      message: 'Login successful',
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: learningCenter,
      },
    };
  }

  // Tokenni yangilash
  async refreshtoken(refresh_token: string, res: Response) {
    // Refresh tokenni tekshirish
    const payload = this.jwtService.verify(refresh_token);
    // Agar token yaroqsiz bo'lsa, xatolik qaytarish
    if (!payload) {
      throw new BadRequestException('Invalid refresh token');
    }
    // Yangi access token yaratish uchun foydalanuvchi ma'lumotlarini olish
    const learningCenter = await this.learningCenterRepository.findOne({
      where: { id: payload.id },
    });
    // Agar foydalanuvchi topilmasa, xatolik qaytarish
    if (!learningCenter) {
      throw new BadRequestException('User not found');
    }
    // Yangi access token yaratish
    const newPayload = {
      id: learningCenter.id,
      login: learningCenter.login,
      role: learningCenter.role,
    };
    const accessToken = this.jwtService.sign(newPayload, { expiresIn: '1d' });
    // Yangi refresh token yaratish
    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '30d',
    });
    // Yangi refresh tokenni cookie sifatida yozish
    await this.writeToCookie(newRefreshToken, res);
    // Yangi tokenlarni qaytarish
    return {
      status_code: 200,
      message: 'Token refreshed successfully',
      data: { access_token: accessToken, refresh_token: newRefreshToken },
    };
  }

  // Foydalanuvchi ma'lumotlarini olish
  async me(id: number) {
    // Foydalanuvchi ma'lumotlarini olish
    const learningCenter = await this.learningCenterRepository.findOne({
      where: { id },
    });
    // Agar foydalanuvchi topilmasa, xatolik qaytarish
    if (!learningCenter) {
      throw new NotFoundException('User not found');
    }
    // Foydalanuvchi ma'lumotlarini qaytarish
    return {
      status_code: 200,
      message: 'User data retrieved successfully',
      data: learningCenter,
    };
  }
  // Foydalanuvchi ma'lumotlarini yangilash
  async update(
    id: number,
    updateAuthDto: UpdateAuthDto,
    file?: Express.Multer.File | any,
  ) {
    const { name, email, phone } = updateAuthDto;
    // Email unikal bo'lishi kerak
    const emailExists = await this.learningCenterRepository.findOne({
      where: { email },
    })
    if (emailExists) {
      throw new ConflictException('Bu email allaqachon mavjud');
    }
    // Telefon raqami unikal bo'lishi kerak
    if (await this.learningCenterRepository.findOne({ where: { phone } })) {
      throw new ConflictException('Bu telefon raqami allaqachon mavjud');
    }
    // login unikal bo'lishi kerak
    if (
      await this.learningCenterRepository.findOne({
        where: { login: updateAuthDto.login },
      })
    ) {
      throw new ConflictException('Bu login allaqachon mavjud');
    }
    const learningCenter = await this.learningCenterRepository.findOne({
      where: { id },
    });
    // Agar foydalanuvchi topilmasa, xatolik qaytarish
    if (!learningCenter) {
      throw new NotFoundException('User not found');
    }
    // Foydalanuvchi ma'lumotlarini olish
    let logoUrl = learningCenter.image;
    // Agar yangi fayl kiritilgan bo'lsa, eski faylni o'chirish va yangi faylni saqlash
    if (file) {
      if (logoUrl) {
        await this.fileService.deleteFile(logoUrl);
      }
      logoUrl = await this.fileService.createFile(file);
    }
    // Agar parol kiritilgan bo'lsa, uni xeshlash
    if (updateAuthDto.password) {
      const hashedPassword = await this.bcrypt.createBcryptPassword(
        updateAuthDto.password,
      );
      learningCenter.password = hashedPassword;
    }
    // Foydalanuvchi ma'lumotlarini yangilash
    await this.learningCenterRepository.update(id, {
      ...updateAuthDto,
      password: learningCenter.password,
      image: logoUrl,
    });
    // Yangilangan ma'lumotlarni olish
    const updatedLearningCenter = await this.learningCenterRepository.findOne({
      where: { id },
    });
    // Yangilangan ma'lumotlarni qaytarish
    return {
      status_code: 200,
      message: 'User data updated successfully',
      data: updatedLearningCenter,
    };
  }

  // logout
  async logout(res: Response) {
    try {
      res.clearCookie('refresh_token');
      return {
        status_code: 200,
        message: 'Logout successful',
      };
    } catch (error) {
      throw new BadRequestException(`Error on logout: ${error}`);
    }
  }

  // Cookie ga refresh token yozish
  private async writeToCookie(refresh_token: string, res: Response) {
    try {
      res.cookie('refresh_token', refresh_token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    } catch (error) {
      throw new BadRequestException(`Error on write to cookie: ${error}`);
    }
  }
}
