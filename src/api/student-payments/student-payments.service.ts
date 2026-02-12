import { Injectable } from '@nestjs/common';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { UpdateStudentPaymentDto } from './dto/update-student-payment.dto';

@Injectable()
export class StudentPaymentsService {
  create(createStudentPaymentDto: CreateStudentPaymentDto) {
    return 'This action adds a new studentPayment';
  }

  findAll() {
    return `This action returns all studentPayments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} studentPayment`;
  }

  update(id: number, updateStudentPaymentDto: UpdateStudentPaymentDto) {
    return `This action updates a #${id} studentPayment`;
  }

  remove(id: number) {
    return `This action removes a #${id} studentPayment`;
  }
}
