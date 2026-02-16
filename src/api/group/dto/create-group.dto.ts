import {
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'IELTS 7.0', description: 'Guruh nomi' })
  @IsString()
  name: string;

  @ApiProperty({
    example: '2024-01-15',
    description: 'Guruh boshlanish sanasi',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-15', description: 'Guruh tugash sanasi' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 3, description: 'Haftada necha marta dars' })
  @IsInt()
  @Min(1)
  @Max(7)
  lessonDays: number;

  @ApiProperty({ example: '15:00', description: 'Dars vaqti' })
  @IsString()
  lessonTime: string;

  @ApiProperty({ example: 500000, description: "Oylik to'lov miqdori" })
  @IsNumber()
  @IsPositive()
  monthlyPrice: number;

  @ApiProperty({
    example: true,
    description: 'Guruh faolligi',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: 15,
    description: 'Maksimal talabalar soni',
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({
    example: '201-xona',
    description: 'Xona nomi',
    required: false,
  })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({
    example: 'IELTS tayyorgarlik guruhi',
    description: "Qo'shimcha ma'lumot",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 0,
    description: 'Hozirgi talabalar soni',
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  currentStudents?: number;

  // Foreign keys - number type (integer) qilib o'zgartirildi
  @ApiProperty({ example: 1, description: "O'qituvchi ID si" })
  @IsInt()
  @IsPositive()
  @IsOptional()
  teacher_id?: number;

  @ApiProperty({ example: 1, description: "O'quv markazi ID si" })
  @IsInt()
  @IsPositive()
  learning_center_id: number;
}
