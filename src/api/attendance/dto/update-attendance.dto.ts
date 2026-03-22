// update-attendance.dto.ts
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

export class UpdateStudentAttendanceDto {
  @IsInt()
  studentId: number;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;
}

export class UpdateAttendanceDto {
  @IsOptional()
  @IsInt()
  groupId?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentAttendanceDto)
  students?: UpdateStudentAttendanceDto[];

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
