import { IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Foydalanuvchi logini',
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  login: string;

  @ApiProperty({
    description: 'Parol',
    example: 'StrongP@ssw0rd123',
    minLength: 8,
  })
  @IsStrongPassword()
  @IsString()
  password: string;
}
