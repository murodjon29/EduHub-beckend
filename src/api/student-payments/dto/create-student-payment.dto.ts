import { IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateStudentPaymentDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  group_id: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsDateString()
  month: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  paidAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}