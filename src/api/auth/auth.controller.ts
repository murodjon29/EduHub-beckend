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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Ro'yxatdan o'tish
  @Post('register')
  @UseInterceptors(FileInterceptor('file')) // 'file' - formdagi field nomi
  register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File | any,
  ) {
    return this.authService.register(registerDto, file);
  }

  // Kirish
  @Post('login')
  login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(loginDto, res);
  }

  // Tokenni yangilash
  @Post('refresh-token')
  refreshToken(
    @Body('refresh_token') refresh_token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshtoken(refresh_token, res);
  }

  // Foydalanuvchi ma'lumotlarini olish
  @Get('me/:id')
  me(@Param('id') id: string) {
    return this.authService.me(+id);
  }
}
