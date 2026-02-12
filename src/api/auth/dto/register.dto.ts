import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class RegisterDto {
  @IsString()
  login: string;

  @IsStrongPassword() // Kuchli parol talab qilinadi
  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  @IsEmail()
  email: string;
}
