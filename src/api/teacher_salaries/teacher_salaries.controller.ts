import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TeacherSalariesService } from './teacher_salaries.service';
import { CreateTeacherSalaryDto } from './dto/create-teacher_salary.dto';
import { UpdateTeacherSalaryDto } from './dto/update-teacher_salary.dto';

@Controller('teacher-salaries')
export class TeacherSalariesController {
  constructor(
    private readonly teacherSalariesService: TeacherSalariesService,
  ) {}

  @Post()
  create(@Body() createTeacherSalaryDto: CreateTeacherSalaryDto) {
    return this.teacherSalariesService.create(createTeacherSalaryDto);
  }

  @Get()
  findAll() {
    return this.teacherSalariesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teacherSalariesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeacherSalaryDto: UpdateTeacherSalaryDto,
  ) {
    return this.teacherSalariesService.update(+id, updateTeacherSalaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teacherSalariesService.remove(+id);
  }
}
