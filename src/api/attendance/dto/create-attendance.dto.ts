import {
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';
import { AttendanceStatus } from '../../../common/enum';

export class CreateAttendanceDto {
  @IsInt()
  groupId: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  studentIds: number[];

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
