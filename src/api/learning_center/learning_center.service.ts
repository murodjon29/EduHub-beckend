import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLearningCenterDto } from './dto/create-learning_center.dto';
import { UpdateLearningCenterDto } from './dto/update-learning_center.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { Repository, Between } from 'typeorm';
import { FileService } from '../file/file.service';
import { Student } from '../../core/entities/student.entity';
import { Teacher } from '../../core/entities/teacher.entity';
import { StudentPayment } from '../../core/entities/student-payment.entity';
import { Lesson } from '../../core/entities/lesson.entity';

@Injectable()
export class LearningCenterService {
  constructor(
    @InjectRepository(LearningCenter)
    private readonly learningCenterRepository: Repository<LearningCenter>,

    private readonly fileService: FileService,

    @InjectRepository(StudentPayment)
    private readonly studentPaymentsRepository: Repository<StudentPayment>,

    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async findLearningCenterStudents(learningCenterId: number) {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.groupStudents', 'groupStudent')
      .leftJoinAndSelect('groupStudent.group', 'group')
      .leftJoinAndSelect('student.learningCenter', 'learningCenter')
      .where('student.learningCenter.id = :learningCenterId', {
        learningCenterId,
      })
      .orderBy('student.id', 'ASC')
      .getMany();

    return {
      statusCode: 200,
      message: "O'quvchilar muvaffaqiyatli topildi",
      data: students,
    };
  }

  async getTeachersByLearningCenter(learningCenterId: number) {
    const teachers = await this.teacherRepository
      .createQueryBuilder('teacher')
      .where('teacher.learningCenter.id = :learningCenterId', {
        learningCenterId,
      })
      .orderBy('teacher.id', 'ASC')
      .getMany();

    return {
      statusCode: 200,
      message: "O'qituvchilar topildi",
      data: teachers,
    };
  }

  async deleteProfileImage(lerningCenterId: number) {
    const lerningCenter = await this.learningCenterRepository.findOne({
      where: { id: lerningCenterId },
    });
    if (!lerningCenter) {
      throw new NotFoundException('User not found');
    }
    if (lerningCenter.image) {
      await this.fileService.deleteFile(lerningCenter.image);
      lerningCenter.image = '';
      await this.learningCenterRepository.save(lerningCenter);
      return {
        success: true,
        message: 'Profile image deleted successfully',
      };
    } else {
      return {
        success: false,
        message: 'Profile image not found',
      };
    }
  }

  async statistics(learningCenterId: number) {
    const studentCount = await this.studentRepository.count({
      where: { learningCenter: { id: learningCenterId } },
    });

    const teacherCount = await this.teacherRepository.count({
      where: { learningCenter: { id: learningCenterId } },
    });

    // StudentPayment orqali to'g'ridan-to'g'ri totalPayments hisoblash
    const totalPaymentsResult = await this.studentPaymentsRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.student', 'student')
      .leftJoin('student.learningCenter', 'learningCenter')
      .where('learningCenter.id = :learningCenterId', { learningCenterId })
      .select('SUM(payment.paidAmount)', 'total')
      .getRawOne();

    const totalPayments = parseFloat(totalPaymentsResult?.total ?? '0');

    return {
      statusCode: 200,
      message: 'Statistika muvaffaqiyatli olindi',
      data: {
        studentCount,
        teacherCount,
        totalPayments,
      },
    };
  }
  async getCalendarData(learningCenterId: number, year: number, month: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // 1️⃣ Lessons (hamma fieldlari bilan)
    const lessons = await this.lessonRepository.find({
      where: {
        group: {
          learningCenter: {
            id: learningCenterId,
          },
        },
        lessonDate: Between(startDate, endDate),
      },
      relations: ['group', 'teacher'],
    });

    // 2️⃣ Payments
    const payments = await this.studentPaymentsRepository.find({
      where: {
        student: {
          learningCenter: {
            id: learningCenterId,
          },
        },
        paymentDate: Between(startDate, endDate),
      },
      relations: ['student'],
    });

    // 3️⃣ Birthdays
    const birthdays = await this.studentRepository
      .createQueryBuilder('student')
      .where('student.learningCenterId = :learningCenterId', {
        learningCenterId,
      })
      .andWhere('EXTRACT(MONTH FROM student.birthDate) = :month', { month })
      .andWhere('student.isActive = true')
      .getMany();

    const calendarData: Record<
      string,
      {
        date: string;
        lessons: any[];
        payments: any[];
        birthdays: any[];
      }
    > = {};

    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const dayLessons = lessons
        .filter((l) => l.lessonDate === dateStr)
        .map((l) => ({
          id: l.id,
          name: l.group?.name,
          lessonName: l.name,
          time: `${l.startTime} - ${l.endTime}`,
          group: l.group,
          teacher: l.teacher,
        }));

      const dayPayments = payments
        .filter((p) => p.paymentDate === dateStr)
        .map((p) => ({
          id: p.id,
          amount: p.amount,
          paidAmount: p.paidAmount,
          month: p.month,
          student: p.student,
        }));

      const dayBirthdays = birthdays
        .filter((student) => {
          const bdDay = parseInt(student.birthDate.split('-')[2]);
          return bdDay === day;
        })
        .map((student) => ({
          id: student.id,
          fullName: student.fullName,
          phone: student.phone,
          birthDate: student.birthDate,
        }));

      if (dayLessons.length || dayPayments.length || dayBirthdays.length) {
        calendarData[dateStr] = {
          date: dateStr,
          lessons: dayLessons,
          payments: dayPayments,
          birthdays: dayBirthdays,
        };
      }
    }

    return {
      statusCode: 200,
      message: "Kalendar ma'lumotlari muvaffaqiyatli olindi",
      data: calendarData,
    };
  }

  async findLessonsByLearningCenter(learningCenterId: number) {
    const lessons = await this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoin('lesson.group', 'group')
      .leftJoin('group.learningCenter', 'lc')
      .leftJoin('lesson.teacher', 'teacher')
      .where('lc.id = :learningCenterId', { learningCenterId })
      .select([
        'lesson.id',
        'lesson.name',
        'lesson.lessonDate',
        'lesson.startTime',
        'lesson.endTime',
        'group.id',
        'group.name',
        'teacher.id',
        'teacher.firstName',
        'teacher.lastName',
      ])
      .getMany();

    return {
      success: true,
      message: 'Lessons retrieved successfully',
      data: lessons,
    };
  }

  async getPaymentsByLearningCenter(learningCenterId: number) {
    const payments = await this.studentPaymentsRepository
      .createQueryBuilder('student_payments')
      .leftJoin('student_payments.student', 'student')
      .leftJoin('student.learningCenter', 'lc')
      .where('lc.id = :learningCenterId', { learningCenterId })
      .select([
        'student_payments.id',
        'student_payments.amount',
        'student_payments.paidAmount',
        'student_payments.paymentDate',
        'student.id',
        'student.fullName',
      ])
      .getMany();

    return {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
    };
  }
}
