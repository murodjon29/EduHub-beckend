import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '../../core/entities/teacher.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';
import { Response } from 'express';
import { TeacherLoginDto } from './dto/teacher-login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher) private teacherRepository: Repository<Teacher>,
    private readonly bcrypt: BcryptManage,
    private readonly jwt: JwtService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const {
      email,
      name,
      lastName,
      phone,
      salary,
      password,
      login,
      learningCenterId,
    } = createTeacherDto;
    const learningCenter = await this.teacherRepository.manager.findOne(
      'learning_centers',
      { where: { id: learningCenterId } },
    );
    // O'quv markazi mavjudligini tekshirish
    if (!learningCenter) {
      throw new NotFoundException("O'quv markazi topilmadi");
    }
    // Login unikal bo'lishi kerak
    if (await this.teacherRepository.findOne({ where: { login } })) {
      throw new ConflictException(
        "Bu login bilan o'qituvchi allaqachon mavjud",
      );
    }
    const hashedPassword = await this.bcrypt.createBcryptPassword(password);
    createTeacherDto.password = hashedPassword;
    const teacher = this.teacherRepository.create({
      name,
      lastName,
      phone,
      salary,
      password: hashedPassword,
      email,
      login,
      subject: createTeacherDto.subject,
      learningCenter: learningCenter,
    });
    await this.teacherRepository.save(teacher);
    return {
      statusCode: 201,
      message: "O'qituvchi muvaffaqiyatli yaratildi",
      data: teacher,
    };
  }

  async login(dto: TeacherLoginDto, res: Response) {
    const { login, password } = dto;
    // Login bo'yicha o'qituvchini topish
    const teacher = await this.teacherRepository.findOne({ where: { login } });
    // Agar o'qituvchi topilmasa yoki parol noto'g'ri bo'lsa, xato xabarini qaytarish
    if (!teacher) {
      throw new NotFoundException("Login noto'g'ri");
    }
    // Parolni tekshirish
    const isPasswordValid = await this.bcrypt.comparePassword(
      password,
      teacher.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException("Parol noto'g'ri");
    }
    // JWT tokenlarini yaratish
    const payload = {
      id: teacher.id,
      login: teacher.login,
      role: teacher.role,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });
    // Refresh tokenni cookie ga yozish
    await this.writeToCookie(refreshToken, res);
    return {
      statusCode: 200,
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      data: {
        accessToken,
        refreshToken,
        teacher,
      },
    };
  }

  async refreshToken(oldRefreshToken: string, res: Response) {
    try {
      const payload = await this.jwt.verifyAsync(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const newPayload = {
        id: payload.id,
        login: payload.login,
        role: payload.role,
      };
      const accessToken = await this.jwt.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      });
      const refreshToken = await this.jwt.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      });
      await this.writeToCookie(refreshToken, res);
      return {
        statusCode: 200,
        message: 'Token muvaffaqiyatli yangilandi',
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    try {
      res.clearCookie('refresh_token');
      return {
        statusCode: 200,
        message: 'Tizimdan muvaffaqiyatli chiqildi',
      };
    } catch (error) {
      throw new BadRequestException(`Error on logout: ${error}`);
    }
  }

  async filterTeacher(search: string, learningCenterId: number) {
    // O'qituvchilarni qidirish
    const teachers = await this.teacherRepository
      // ILIKE operatori yordamida qidiruvni amalga oshirish (PostgreSQL uchun)
      .createQueryBuilder('teacher')
      // O'quv markazi bo'yicha filtrlash
      .where('teacher.learningCenterId = :learningCenterId', {
        learningCenterId,
      })
      // Ism qarab qidirish
      .where('teacher.name ILIKE :search', { search: `%${search}%` })
      // Familiya qarab qidirish
      .orWhere('teacher.lastName ILIKE :search', { search: `%${search}%` })
      // Email qarab qidirish
      .orWhere('teacher.email ILIKE :search', { search: `%${search}%` })
      // Telefon raqami qarab qidirish
      .orWhere('teacher.phone ILIKE :search', { search: `%${search}%` })
      // subject qarab qidirish
      .orWhere('teacher.subject ILIKE :search', { search: `%${search}%` })
      // Natijalarni olish
      .getMany();
    return {
      statusCode: 200,
      message: 'Qidiruv natijalari',
      data: teachers,
    };
  }

  // Barcha o'qituvchilarni olish
  async findAll() {
    const teachers = await this.teacherRepository.find();
    return {
      statusCode: 200,
      message: "O'qituvchilar muvaffaqiyatli topildi",
      data: teachers,
    };
  }

  // ID bo'yicha o'qituvchini olish
  async findOne(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }
    return {
      statusCode: 200,
      message: "O'qituvchi muvaffaqiyatli topildi",
      data: teacher,
    };
  }

  // ID bo'yicha o'qituvchini yangilash
  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    const { learningCenterId } = updateTeacherDto;
    // Agar o'quv markazi yangilanayotgan bo'lsa, uning mavjudligini tekshirish
    if (learningCenterId) {
      // O'quv markazi mavjudligini tekshirish
      const learningCenter = await this.teacherRepository.manager.findOne(
        'learning_centers',
        { where: { id: learningCenterId } },
      );
      // Agar o'quv markazi topilmasa, xato xabarini qaytarish
      if (!learningCenter) {
        throw new NotFoundException("O'quv markazi topilmadi");
      }
    }
    // O'qituvchi mavjudligini tekshirish
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }
    // Agar email yangilanayotgan bo'lsa, uning unikal ekanligini tekshirish
    if (
      await this.teacherRepository.findOne({
        where: { email: updateTeacherDto.email },
      })
    ) {
      throw new ConflictException(
        "Bu email manzili bilan o'qituvchi allaqachon mavjud",
      );
    }
    // Agar telefon raqami yangilanayotgan bo'lsa, uning unikal ekanligini tekshirish
    if (
      await this.teacherRepository.findOne({
        where: { phone: updateTeacherDto.phone },
      })
    ) {
      throw new ConflictException(
        "Bu telefon raqami bilan o'qituvchi allaqachon mavjud",
      );
    }
    // Agar login yangilanayotgan bo'lsa, uning unikal ekanligini tekshirish
    if (
      await this.teacherRepository.findOne({
        where: { login: updateTeacherDto.login },
      })
    ) {
      throw new ConflictException(
        "Bu login bilan o'qituvchi allaqachon mavjud",
      );
    }
    // Agar parol yangilanayotgan bo'lsa, uni hash qilish
    if (updateTeacherDto.password) {
      updateTeacherDto.password = await this.bcrypt.createBcryptPassword(
        updateTeacherDto.password,
      );
    }
    // O'qituvchi ma'lumotlarini yangilash
    const updatedTeacher = Object.assign(teacher, updateTeacherDto);
    await this.teacherRepository.save(updatedTeacher);
    return {
      statusCode: 200,
      message: "O'qituvchi muvaffaqiyatli yangilandi",
      data: updatedTeacher,
    };
  }

  // ID bo'yicha o'qituvchini o'chirish
  async remove(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }
    await this.teacherRepository.remove(teacher);
    return {
      statusCode: 200,
      message: "O'qituvchi muvaffaqiyatli o'chirildi",
    };
  }
  // refresh tokenni cookie ga yozish uchun yordamchi metod
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
