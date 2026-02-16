import {
  IsEmail,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Foydalanuvchi logini',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  login: string;

  @ApiProperty({
    description:
      'Kuchli parol (kamida 8 belgi, katta va kichik harflar, raqam va maxsus belgi)',
    example: 'StrongP@ssw0rd123',
    minLength: 8,
  })
  @IsStrongPassword()
  @IsString()
  password: string;

  @ApiProperty({
    description: "Foydalanuvchi to'liq ismi",
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Telefon raqami',
    example: '+998901234567',
    pattern: '^\\+998[0-9]{9}$',
  })
  @IsString()
  @IsPhoneNumber('UZ') // O'zbekiston telefon raqami formatini tekshiradi
  phone: string;

  @ApiProperty({
    description: 'Email manzili',
    example: 'john@example.com',
    format: 'email',
  })
  @IsString()
  @IsEmail()
  email: string;
}
