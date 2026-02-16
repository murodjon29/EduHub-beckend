import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateTeacherDto {
  @IsEmail()
  @ApiProperty({
    description: "O'qituvchining email manzili",
    example: 'i5A4o@example.com',
  })
  email: string; // Email manzili

  @IsString()
  @ApiProperty({
    description: "O'qituvchining ismi",
    example: 'John',
  })
  name: string; // O'qituvchining ismi

  @IsString()
  @ApiProperty({
    description: "O'qituvchining familiyasi",
    example: 'Doe',
  })
  lastName: string; // O'qituvchining familiyasi

  @ApiProperty({
    description: "O'qituvchining telefon raqami",
    example: '+998901234567',
  })
  @IsString()
  @IsPhoneNumber('UZ')
  phone: string;

  @ApiProperty({
    description: "O'qituvchining asosiy oylik maoshi",
    example: 5000,
  })
  @IsNumber()
  salary: number; // Asosiy oylik maoshi

  @ApiProperty({
    description: "O'qituvchining paroli",
    example: 'StrongP@ssw0rd123',
  })
  @IsString()
  @IsStrongPassword()
  password: string; // Parol (hashlangan)

  @ApiProperty({
    description: "O'qituvchining tizimga kirish logini",
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  login: string; // Tizimga kirish logini

  // O'qituvchi qaysi fan bo'yicha dars beradi (masalan, Matematika, Ingliz tili, Fizika va h.k.)
  @ApiProperty({
    description:
      "O'qituvchi qaysi fan bo'yicha dars beradi (masalan, Matematika, Ingliz tili, Fizika va h.k.)",
    example: 'Matematika',
  })
  @IsString()
  subject: string; // O'qituvchi qaysi fan bo'yicha dars beradi

  @ApiProperty({
    description: "O'qituvchi qaysi o'quv markazda ishlaydi (ID si)",
    example: 1,
  })
  @IsNumber()
  learningCenterId: number; // O'quv markaz ID si (foreign key)
}
