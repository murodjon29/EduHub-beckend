import { Module } from '@nestjs/common';
import { StudentPaymentsService } from './student-payments.service';
import { StudentPaymentsController } from './student-payments.controller';

@Module({
  controllers: [StudentPaymentsController],
  providers: [StudentPaymentsService],
})
export class StudentPaymentsModule {}
