import { IsString, IsStrongPassword } from 'class-validator';
export class LoginDto {
  @IsString()
  login: string;
  @IsStrongPassword() // Kuchli parol talab qilinadi
  @IsString()
  password: string;
}
