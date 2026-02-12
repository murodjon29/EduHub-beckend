import { Injectable } from '@nestjs/common';
import { CreateGroupStudentDto } from './dto/create-group_student.dto';
import { UpdateGroupStudentDto } from './dto/update-group_student.dto';

@Injectable()
export class GroupStudentsService {
  create(createGroupStudentDto: CreateGroupStudentDto) {
    return 'This action adds a new groupStudent';
  }

  findAll() {
    return `This action returns all groupStudents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} groupStudent`;
  }

  update(id: number, updateGroupStudentDto: UpdateGroupStudentDto) {
    return `This action updates a #${id} groupStudent`;
  }

  remove(id: number) {
    return `This action removes a #${id} groupStudent`;
  }
}
