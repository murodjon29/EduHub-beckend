import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class TeacherLoginDto {
  @ApiProperty({
    description: "O'qituvchining tizimga kirish logini",
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  login: string; // Tizimga kirish logini kiritiladi

  @ApiProperty({
    description: "O'qituvchining paroli",
    example: 'StrongP@ssw0rd123',
    minLength: 8,
  })
  @IsString()
  password: string; // Parol kiritiladi
}
