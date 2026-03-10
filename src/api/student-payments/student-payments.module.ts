import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentPayment } from '../../core/entities/student-payment.entity';
import { Student } from '../../core/entities/student.entity';
import { Group } from '../../core/entities/group.entity';
import { StudentPaymentController } from './student-payments.controller';
import { StudentPaymentService } from './student-payments.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentPayment, Student, Group])],
  controllers: [StudentPaymentController],
  providers: [StudentPaymentService],
  exports: [StudentPaymentService],
})
export class StudentPaymentModule {}
