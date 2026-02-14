import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  Get,
  Param,
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
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // register, login, refresh token, me endpointlari
  @Post('register')
  @ApiOperation({ summary: 'Yangi foydalanuvchi ro\'yxatdan o\'tkazish' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Foydalanuvchi ma\'lumotlari',
    type: RegisterDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tkazildi',
    type: RegisterDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.authService.register(registerDto, file);
  }

  @Post('login')
  @ApiOperation({ summary: 'Tizimga kirish' })
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
        },
      },
    },
  })
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Tokenni yangilash' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token muvaffaqiyatli yangilandi',
  })
  refreshToken(
    @Body('refresh_token') refresh_token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshtoken(refresh_token, res);
  }

  @Get('me/:id')
  @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlarini olish' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Foydalanuvchi ma\'lumotlari',
  })
  me(@Param('id') id: string) {
    return this.authService.me(+id);
  }
}