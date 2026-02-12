import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { GroupStudentsService } from './group_students.service';
import { CreateGroupStudentDto } from './dto/create-group_student.dto';
import { UpdateGroupStudentDto } from './dto/update-group_student.dto';

@Controller('group-students')
export class GroupStudentsController {
  constructor(private readonly groupStudentsService: GroupStudentsService) {}

  @Post()
  create(@Body() createGroupStudentDto: CreateGroupStudentDto) {
    return this.groupStudentsService.create(createGroupStudentDto);
  }

  @Get()
  findAll() {
    return this.groupStudentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupStudentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGroupStudentDto: UpdateGroupStudentDto,
  ) {
    return this.groupStudentsService.update(+id, updateGroupStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupStudentsService.remove(+id);
  }
}
