import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsInt,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ example: 'IELTS 7.0' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-06-15' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Mon,Wed,Fri' })
  @IsString()
  lessonDays: string;

  @ApiProperty({ example: '15:00' })
  @IsString()
  lessonTime: string;

  @ApiProperty({ example: 500000 })
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  monthlyPrice: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 15, required: false })
  @Transform(({ value }) => (value !== undefined ? parseInt(value) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({ example: '201-xona', required: false })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ example: 'IELTS tayyorgarlik guruhi', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 0, required: false })
  @Transform(({ value }) => (value !== undefined ? parseInt(value) : undefined))
  @IsInt()
  @IsOptional()
  currentStudents?: number;

  @ApiProperty({ example: 1, required: false })
  @Transform(({ value }) => (value !== undefined ? parseInt(value) : undefined))
  @IsInt()
  @IsPositive()
  @IsOptional()
  teacher_id?: number;

  @ApiProperty({ example: 1 })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @IsPositive()
  learning_center_id: number;
}
