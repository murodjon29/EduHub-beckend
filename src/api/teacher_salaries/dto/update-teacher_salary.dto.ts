import { PartialType } from '@nestjs/swagger';
import { CreateTeacherSalaryDto } from './create-teacher_salary.dto';

export class UpdateTeacherSalaryDto extends PartialType(
  CreateTeacherSalaryDto,
) {}
