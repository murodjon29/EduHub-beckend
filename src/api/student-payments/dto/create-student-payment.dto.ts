import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentPaymentDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  group_id: number;

  @IsNumber()
  amount: number;

  @IsDateString()
  month: string;

  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @IsNumber()
  discount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  learningCenterId: number; // O'quv markazi IDsi (guruh orqali olinadi)
}
