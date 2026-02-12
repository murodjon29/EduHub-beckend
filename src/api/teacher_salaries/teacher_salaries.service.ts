import { Injectable } from '@nestjs/common';
import { CreateTeacherSalaryDto } from './dto/create-teacher_salary.dto';
import { UpdateTeacherSalaryDto } from './dto/update-teacher_salary.dto';

@Injectable()
export class TeacherSalariesService {
  create(createTeacherSalaryDto: CreateTeacherSalaryDto) {
    return 'This action adds a new teacherSalary';
  }

  findAll() {
    return `This action returns all teacherSalaries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} teacherSalary`;
  }

  update(id: number, updateTeacherSalaryDto: UpdateTeacherSalaryDto) {
    return `This action updates a #${id} teacherSalary`;
  }

  remove(id: number) {
    return `This action removes a #${id} teacherSalary`;
  }
}
