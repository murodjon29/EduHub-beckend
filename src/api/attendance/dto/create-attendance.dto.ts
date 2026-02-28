import { IsEnum, IsInt, IsOptional, IsDateString } from 'class-validator';
import { AttendanceStatus } from '../../../common/enum';

export class CreateAttendanceDto {
  @IsInt()
  groupId: number;

  @IsInt()
  studentId: number;

  @IsOptional()
  @IsInt()
  teacherId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}
