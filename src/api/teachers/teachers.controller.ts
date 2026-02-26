// src/teachers/teachers.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherLoginDto } from './dto/teacher-login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { SelfGuard } from '../../common/guard/self.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { AdminRoles, Role } from '../../common/enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiBearerAuth("Authorization")
  @Post()
  @ApiOperation({
    summary: "Yangi o'qituvchi qo'shish",
    description: "Yangi o'qituvchi ma'lumotlarini kiritish",
  })
  @ApiBody({ type: CreateTeacherDto })
  @ApiResponse({
    status: 201,
    description: "O'qituvchi muvaffaqiyatli yaratildi",
    schema: {
      example: {
        statusCode: 201,
        message: "O'qituvchi muvaffaqiyatli yaratildi",
        data: {
          id: 1,
          login: 'teacher_john',
          name: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+998901234567',
          subject: 'Matematika',
          salary: 5000000,
          role: 'teacher',
          learningCenterId: 1,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quv markazi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quv markazi topilmadi",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Conflict - Ma'lumotlar allaqachon mavjud",
    schema: {
      example: {
        statusCode: 409,
        message: "Bu email manzili bilan o'qituvchi allaqachon mavjud",
        error: 'Conflict',
      },
    },
  })
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Post('login')
  @ApiOperation({
    summary: "O'qituvchi tizimga kirishi",
    description: 'Login va parol orqali tizimga kirish',
  })
  @ApiBody({ type: TeacherLoginDto })
  @ApiResponse({
    status: 200,
    description: 'Tizimga muvaffaqiyatli kirish',
    schema: {
      example: {
        statusCode: 200,
        message: 'Tizimga muvaffaqiyatli kirdingiz',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          teacher: {
            id: 1,
            login: 'teacher_john',
            name: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+998901234567',
            subject: 'Matematika',
            role: 'teacher',
            learningCenterId: 1,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Login noto'g'ri",
    schema: {
      example: {
        statusCode: 404,
        message: "Login noto'g'ri",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Parol noto'g'ri",
    schema: {
      example: {
        statusCode: 400,
        message: "Parol noto'g'ri",
        error: 'Bad Request',
      },
    },
  })
  login(
    @Body() loginDto: TeacherLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.teachersService.login(loginDto, res);
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Tokenni yangilash',
    description: 'Refresh token orqali yangi access token olish',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token muvaffaqiyatli yangilandi',
    schema: {
      example: {
        statusCode: 200,
        message: 'Token muvaffaqiyatli yangilandi',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Yaroqsiz refresh token',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid refresh token',
        error: 'Bad Request',
      },
    },
  })
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.teachersService.refreshToken(
      refreshTokenDto.refresh_token,
      res,
    );
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Tizimdan chiqish',
    description: "Cookie dagi refresh tokenni o'chirish",
  })
  @ApiResponse({
    status: 200,
    description: 'Tizimdan muvaffaqiyatli chiqildi',
    schema: {
      example: {
        statusCode: 200,
        message: 'Tizimdan muvaffaqiyatli chiqildi',
      },
    },
  })
  logout(@Res({ passthrough: true }) res: Response) {
    return this.teachersService.logout(res);
  }

  @Get('search')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiBearerAuth("Authorization")
  @ApiOperation({
    summary: "O'qituvchilarni qidirish",
    description: "Ism, familiya, email, telefon yoki fan bo'yicha qidirish",
  })
  @ApiQuery({
    name: 'search',
    description: "Qidiruv so'zi",
    required: true,
    example: 'John',
  })
  @ApiQuery({
    name: 'learningCenterId',
    description: "O'quv markazi ID si",
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Qidiruv natijalari',
    schema: {
      example: {
        statusCode: 200,
        message: 'Qidiruv natijalari',
        data: [
          {
            id: 1,
            login: 'teacher_john',
            name: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+998901234567',
            subject: 'Matematika',
            salary: 5000000,
            role: 'teacher',
            learningCenterId: 1,
          },
        ],
      },
    },
  })
  filterTeacher(
    @Query('search') search: string,
    @Query('learningCenterId') learningCenterId: string,
  ) {
    return this.teachersService.filterTeacher(search, +learningCenterId);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiBearerAuth("Authorization")
  @ApiOperation({
    summary: "Barcha o'qituvchilarni olish",
    description: "Tizimdagi barcha o'qituvchilar ro'yxati",
  })
  @ApiResponse({
    status: 200,
    description: "O'qituvchilar ro'yxati",
    schema: {
      example: {
        statusCode: 200,
        message: "O'qituvchilar muvaffaqiyatli topildi",
        data: [
          {
            id: 1,
            login: 'teacher_john',
            name: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+998901234567',
            subject: 'Matematika',
            salary: 5000000,
            role: 'teacher',
            learningCenterId: 1,
            created_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: 2,
            login: 'teacher_jane',
            name: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '+998901234568',
            subject: 'Fizika',
            salary: 5500000,
            role: 'teacher',
            learningCenterId: 1,
            created_at: '2024-01-16T09:20:00.000Z',
          },
        ],
      },
    },
  })
  findAll() {
    return this.teachersService.findAll();
  }

  @ApiQuery({
    name: 'learningCenterId',
    description: "O'quv markazi ID si",
    required: true,
    example: 1,
  })
  @ApiBody({
    description: "O'quv markazi ID si",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "O'quv markaziga tegishli o'qituvchilar ro'yxati",
    schema: {
      example: {
        statusCode: 200,
        message:
          "O'quv markaziga tegishli o'qituvchilar muvaffaqiyatli topildi",
        data: [
          {
            id: 1,
            login: 'teacher_john',
            name: 'John',
            lastName: 'Doe',
            email: '  john.doe@example.com',
            phone: '+998901234567',
            subject: 'Matematika',
            salary: 5000000,
            role: 'teacher',
            learningCenterId: 1,
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z',
          },
          {
            id: 2,
            login: 'teacher_jane',
            name: 'Jane',
            lastName: 'Smith',
            email: '  jane.smith@example.com',
            phone: '+998901234568',
            subject: 'Fizika',
            salary: 5500000,
            role: 'teacher',
            learningCenterId: 1,
            created_at: '2024-01-16T09:20:00.000Z',
            updated_at: '2024-01-16T09:20:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quv markazi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quv markazi topilmadi",
        error: 'Not Found',
      },
    },
  })
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiBearerAuth("Authorization")
  @Get('learning-center/teachers')
  async findLearningCenterTeachers(
    @Query('learningCenterId') learningCenterId: string,
  ) {
    return this.teachersService.getTeachersByLearningCenter(+learningCenterId);
  }

  @Get(':id')
  @UseGuards(JwtGuard, SelfGuard)
  @ApiBearerAuth("Authorization")
  @ApiOperation({
    summary: "O'qituvchini ID bo'yicha olish",
    description: "Berilgan ID ga mos o'qituvchi ma'lumotlari",
  })
  @ApiResponse({
    status: 200,
    description: "O'qituvchi topildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'qituvchi muvaffaqiyatli topildi",
        data: {
          id: 1,
          login: 'teacher_john',
          name: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+998901234567',
          subject: 'Matematika',
          salary: 5000000,
          role: 'teacher',
          learningCenterId: 1,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'qituvchi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'qituvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtGuard, SelfGuard)
  @ApiBearerAuth("Authorization")
  @ApiOperation({
    summary: "O'qituvchi ma'lumotlarini yangilash",
    description: "Berilgan ID ga mos o'qituvchi ma'lumotlarini yangilash",
  })
  @ApiBody({ type: UpdateTeacherDto })
  @ApiResponse({
    status: 200,
    description: "O'qituvchi yangilandi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'qituvchi muvaffaqiyatli yangilandi",
        data: {
          id: 1,
          login: 'teacher_john',
          name: 'John',
          lastName: 'Doe',
          email: 'john.updated@example.com',
          phone: '+998901234567',
          subject: 'Matematika',
          salary: 6000000,
          role: 'teacher',
          learningCenterId: 1,
          updated_at: '2024-01-20T15:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'qituvchi yoki o'quv markazi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'qituvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Conflict - Ma'lumotlar allaqachon mavjud",
    schema: {
      example: {
        statusCode: 409,
        message: "Bu email manzili bilan o'qituvchi allaqachon mavjud",
        error: 'Conflict',
      },
    },
  })
  update(@Param('id') id: string, @Body() updateTeacherDto: UpdateTeacherDto) {
    return this.teachersService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN)
  @ApiBearerAuth("Authorization")
  @ApiOperation({
    summary: "O'qituvchini o'chirish",
    description: "Berilgan ID ga mos o'qituvchini tizimdan o'chirish",
  })
  @ApiResponse({
    status: 200,
    description: "O'qituvchi o'chirildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'qituvchi muvaffaqiyatli o'chirildi",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'qituvchi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'qituvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
