import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class FilterStudentPaymentDto {
  @IsOptional()
  @IsNumber()
  student_id?: number;

  @IsOptional()
  @IsNumber()
  group_id?: number;

  @IsOptional()
  @IsDateString()
  month?: string;
}
