import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { StudentPayment } from '../../core/entities/student-payment.entity';
import { Student } from '../../core/entities/student.entity';
import { Group } from '../../core/entities/group.entity';

import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { UpdateStudentPaymentDto } from './dto/update-student-payment.dto';
import { FilterStudentPaymentDto } from './dto/filter-student-payment.dto';

@Injectable()
export class StudentPaymentService {
  constructor(
    @InjectRepository(StudentPayment)
    private paymentRepo: Repository<StudentPayment>,

    @InjectRepository(Student)
    private studentRepo: Repository<Student>,

    @InjectRepository(Group)
    private groupRepo: Repository<Group>,
  ) {}

  async create(dto: CreateStudentPaymentDto) {
    const student = await this.studentRepo.findOne({
      where: { id: dto.student_id },
    });

    if (!student) {
      throw new NotFoundException('Student topilmadi');
    }

    const group = await this.groupRepo.findOne({
      where: { id: dto.group_id },
    });

    if (!group) {
      throw new NotFoundException('Group topilmadi');
    }

    const exist = await this.paymentRepo.findOne({
      where: {
        student: { id: dto.student_id },
        group: { id: dto.group_id },
        month: dto.month,
      },
    });

    if (exist) {
      throw new BadRequestException(
        'Bu oquvchi ushbu guruh uchun bu oyda tolov qilgan',
      );
    }

    const payment = this.paymentRepo.create({
      student,
      group,
      amount: dto.amount,
      paidAmount: dto.paidAmount || 0,
      discount: dto.discount || 0,
      description: dto.description,
      month: dto.month,
      learningCenterId: dto.learningCenterId,
    });

    return await this.paymentRepo.save(payment);
  }
  async findAll(learningCenterId: number, filterDto: FilterStudentPaymentDto) {
    const query = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoin('payment.student', 'student')
      .leftJoin('payment.group', 'group')
      .select([
        'payment.id',
        'payment.amount',
        'payment.paymentDate',
        'payment.month',
        'payment.paidAmount',
        'payment.discount',
        'payment.description',

        'student.id',
        'student.fullName',

        'group.id',
        'group.name',
      ])
      .where('payment.learningCenterId = :learningCenterId', {
        learningCenterId,
      });

    if (filterDto.student_id) {
      query.andWhere('student.id = :student_id', {
        student_id: filterDto.student_id,
      });
    }

    if (filterDto.group_id) {
      query.andWhere('group.id = :group_id', {
        group_id: filterDto.group_id,
      });
    }

    if (filterDto.month) {
      query.andWhere('payment.month = :month', {
        month: filterDto.month,
      });
    }

    const payments = await query.orderBy('payment.id', 'DESC').getMany();

    return {
      statusCode: 200,
      message: 'Tolovlar muvaffaqiyatli olingan',
      data: payments,
    };
  }

  async findOne(id: number) {
  const payment = await this.paymentRepo
    .createQueryBuilder('payment')
    .leftJoin('payment.student', 'student')
    .leftJoin('payment.group', 'group')
    .select([
      'payment.id',
      'payment.amount',
      'payment.paymentDate',
      'payment.month',
      'payment.paidAmount',
      'payment.discount',
      'payment.description',

      'student.id',
      'student.fullName',

      'group.id',
      'group.name',
    ])
    .where('payment.id = :id', { id })
    .getOne();

  if (!payment) {
    throw new NotFoundException('Tolov topilmadi');
  }

  return {
    statusCode: 200,
    message: 'Tolov muvaffaqiyatli olingan',
    data: payment,
  };
}
  async update(id: number, dto: UpdateStudentPaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Tolov topilmadi');
    }

    Object.assign(payment, dto);

    return await this.paymentRepo.save(payment);
  }

  async remove(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Tolov topilmadi');
    }

    await this.paymentRepo.remove(payment);

    return {
      message: 'Tolov ochirildi',
    };
  }
}
