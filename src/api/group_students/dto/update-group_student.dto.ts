import { PartialType } from '@nestjs/swagger';
import { CreateGroupStudentDto } from './create-group_student.dto';

export class UpdateGroupStudentDto extends PartialType(CreateGroupStudentDto) {}
