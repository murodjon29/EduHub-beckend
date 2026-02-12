import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StudentPaymentsService } from './student-payments.service';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { UpdateStudentPaymentDto } from './dto/update-student-payment.dto';

@Controller('student-payments')
export class StudentPaymentsController {
  constructor(
    private readonly studentPaymentsService: StudentPaymentsService,
  ) {}

  @Post()
  create(@Body() createStudentPaymentDto: CreateStudentPaymentDto) {
    return this.studentPaymentsService.create(createStudentPaymentDto);
  }

  @Get()
  findAll() {
    return this.studentPaymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentPaymentsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStudentPaymentDto: UpdateStudentPaymentDto,
  ) {
    return this.studentPaymentsService.update(+id, updateStudentPaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentPaymentsService.remove(+id);
  }
}
