// create-attendance.dto.ts
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '../../../common/enum';

export class StudentAttendanceDto {
  @IsInt()
  studentId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class CreateAttendanceDto {
  @IsInt()
  groupId: number;

  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  students: StudentAttendanceDto[];

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
