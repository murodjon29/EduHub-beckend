// src/students/dto/create-student.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsPhoneNumber,
  IsDateString,
  IsNumber,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: "O'quvchining to'liq ismi",
    example: 'Aliyev Alisher',
    minLength: 3,
    maxLength: 255,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  fullName: string;

  @ApiProperty({
    description: "O'quvchining telefon raqami",
    example: '+998901234567',
  })
  @IsPhoneNumber('UZ')
  phone: string;

  @ApiProperty({
    description: 'Ota-onasining telefon raqami',
    example: '+998901234568',
  })
  @IsPhoneNumber('UZ')
  parentPhone: string;

  @ApiProperty({
    description: "Tug'ilgan sanasi",
    example: '2010-05-15',
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    description: "O'quv markazi ID si",
    example: 1,
  })
  @IsNumber()
  learningCenterId: number;

  @ApiProperty({
    description: 'Guruh ID si',
    example: 1,
  })
  @IsNumber()
  groupId: number;

  @ApiProperty({
    description: 'Yashash manzili',
    example: 'Toshkent, Chilonzor tumani',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
