import {
  BadRequestException,
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
      throw new NotFoundException('This email is already registered');

    // Telefon raqami unikal bo'lishi kerak
    if (await this.learningCenterRepository.findOne({ where: { phone } }))
      throw new NotFoundException('This phone number is already registered');

    // login unikal bo'lishi kerak
    if (
      await this.learningCenterRepository.findOne({
        where: { login: registerDto.login },
      })
    )
      throw new NotFoundException('This login is already registered');

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
      where: { login, password },
    });
    if (!learningCenter) {
      throw new NotFoundException('Invalid login');
    }
    const isPasswordValid = await this.bcrypt.comparePassword(
      password,
      learningCenter.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid password');
    }
    // Agar hisob bloklangan bo'lsa, xatolik qaytarish
    if (learningCenter.is_blocked) {
      throw new NotFoundException(
        'Your account is blocked. Please contact support.',
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
      throw new NotFoundException('User not found');
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

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private async writeToCookie(refresh_token: string, res: Response) {
    try {
      res.cookie('refresh_token_store', refresh_token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    } catch (error) {
      throw new BadRequestException(`Error on write to cookie: ${error}`);
    }
  }
}
