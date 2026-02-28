import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({ example: 'Matematika 1-dars' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Algebra asoslari' })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  groupId: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  teacherId: number;

  @ApiProperty({ example: '2026-02-17' })
  @IsDateString()
  lessonDate: string;

  @ApiProperty({ example: '14:00:00' })
  @IsString()
  startTime: string;

  @ApiProperty({ example: '16:00:00' })
  @IsString()
  endTime: string;
}
