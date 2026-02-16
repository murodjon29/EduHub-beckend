import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  Get,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { SelfGuard } from '../../common/guard/self.guard';
import { UpdateAuthDto } from './dto/update.dto';

@ApiTags('auth') // Swaggerda 'auth' tagi ostida guruhlanadi
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Ro'yxatdan o'tish
  @Post('register')
  @ApiOperation({
    summary: "Yangi foydalanuvchi ro'yxatdan o'tkazish",
    description: "Ushbu endpoint orqali yangi foydalanuvchi ro'yxatdan o'tadi",
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Foydalanuvchi ma'lumotlari va profil rasmi",
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string', example: 'john_doe' },
        password: { type: 'string', example: 'StrongP@ssw0rd123' },
        name: { type: 'string', example: 'John Doe' },
        phone: { type: 'string', example: '+998901234567' },
        email: { type: 'string', example: 'john@example.com' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profil rasmi (ixtiyoriy)',
        },
      },
      required: ['login', 'password', 'name', 'phone', 'email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tkazildi",
    schema: {
      example: {
        id: 1,
        login: 'john_doe',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+998901234567',
        image: 'uploads/avatar-1234567890.jpg',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Noto'g'ri ma'lumotlar yoki foydalanuvchi allaqachon mavjud",
    schema: {
      example: {
        statusCode: 409,
        message: 'Bunday login, email yoki telefon raqami allaqachon mavjud',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({
    status: 413,
    description: 'Fayl hajmi juda katta',
    schema: {
      example: {
        statusCode: 413,
        message: 'Fayl hajmi 5MB dan oshmasligi kerak',
        error: 'Payload Too Large',
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File | any,
  ) {
    return this.authService.register(registerDto, file);
  }

  // Kirish
  @Post('login')
  @ApiOperation({
    summary: 'Tizimga kirish',
    description: 'Login va parol orqali tizimga kirish',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli kirish',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          login: 'john_doe',
          name: 'John Doe',
          email: 'john@example.com',
          image: 'uploads/avatar.jpg',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Noto'g'ri login yoki parol",
    schema: {
      example: {
        statusCode: 400,
        message: "Login yoki parol noto'g'ri",
        error: 'Unauthorized',
      },
    },
  })
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  // Chiqish
  @Post('logout')
  @ApiOperation({
    summary: 'Tizimdan chiqish',
    description:
      'Refresh tokenni bekor qilib, foydalanuvchini tizimdan chiqaradi',
  })
  @ApiBearerAuth() // Token talab qilinadi
  @ApiResponse({
    status: 200,
    description: 'Muvaffaqiyatli chiqish',
    schema: {
      example: {
        message: 'Muvaffaqiyatli chiqish',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token mavjud emas yoki yaroqsiz',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Token not provided or invalid',
      },
    },
  })
  @UseGuards(JwtGuard)
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // Tokenni yangilash
  @Post('refresh-token')
  @ApiOperation({
    summary: 'Access tokenni yangilash',
    description: 'Refresh token orqali yangi access token olish',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['refresh_token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token muvaffaqiyatli yangilandi',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Yaroqsiz refresh token',
    schema: {
      example: {
        statusCode: 401,
        message: "Refresh token yaroqsiz yoki muddati o'tgan",
        error: 'Unauthorized',
      },
    },
  })
  @ApiBearerAuth() // Token talab qilinadi
  @UseGuards(JwtGuard)
  refreshToken(
    @Body('refresh_token') refresh_token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshtoken(refresh_token, res);
  }

  // Foydalanuvchi ma'lumotlarini olish
  @Get('me/:id')
  @ApiOperation({
    summary: "Foydalanuvchi ma'lumotlarini olish",
    description: "ID bo'yicha foydalanuvchi ma'lumotlarini qaytaradi",
  })
  @ApiParam({
    name: 'id',
    description: 'Foydalanuvchi ID si',
    type: 'number',
    example: 1,
  })
  @ApiBearerAuth() // Token talab qilinadi
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi ma'lumotlari",
    schema: {
      example: {
        id: 1,
        login: 'john_doe',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+998901234567',
        avatar: 'uploads/avatar-1234567890.jpg',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Foydalanuvchi topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Foydalanuvchi topilmadi',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token mavjud emas yoki yaroqsiz',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Token not provided or invalid',
      },
    },
  })
  @UseGuards(JwtGuard, SelfGuard)
  me(@Param('id') id: string) {
    return this.authService.me(+id);
  }

  // Foydalanuvchi ma'lumotlarini yangilash
  @Patch('update/:id')
  @ApiBearerAuth()
  @UseGuards(JwtGuard, SelfGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: "Foydalanuvchi ma'lumotlari va profil rasmi",
    schema: {
      type: 'object',
      properties: {
        login: { type: 'string', example: 'john_doe' },
        password: { type: 'string', example: 'StrongP@ssw0rd123' },
        name: { type: 'string', example: 'John Doe' },
        phone: { type: 'string', example: '+998901234567' },
        email: { type: 'string', example: 'john@example.com' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profil rasmi (ixtiyoriy)',
        },
      },
      required: ['login', 'password', 'name', 'phone', 'email'],
    },
  })
  @ApiOperation({
    summary: "Foydalanuvchi ma'lumotlarini yangilash",
    description: "ID bo'yicha foydalanuvchi ma'lumotlarini yangilash",
  })
  @ApiParam({
    name: 'id',
    description: 'Foydalanuvchi ID si',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Foydalanuvchi ma'lumotlari muvaffaqiyatli yangilandi",
    schema: {
      example: {
        id: 1,
        login: 'john_doe_updated',
        name: 'John Doe Updated',
        email: 'john_updated@example.com',
        phone: '+998901234567',
        image: 'uploads/avatar-updated.jpg',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Foydalanuvchi topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Foydalanuvchi topilmadi',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token mavjud emas yoki yaroqsiz',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Token not provided or invalid',
      },
    },
  })
  @UseGuards(JwtGuard, SelfGuard)
  update(
    @Param('id') id: string,
    @Body() updateAuthDto: UpdateAuthDto,
    @UploadedFile() file?: Express.Multer.File | any,
  ) {
    return this.authService.update(+id, updateAuthDto, file);
  }
}
