import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance } from '../../core/entities/attendance.entity';
import { Group } from '../../core/entities/group.entity';
import { Student } from '../../core/entities/student.entity';
import { Teacher } from '../../core/entities/teacher.entity';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,

    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
  ) {}

  async create(dto: CreateAttendanceDto) {
    const { groupId, students, teacherId, date } = dto;

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group topilmadi');

    let teacher: Teacher | null = null;
    if (teacherId) {
      teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
      if (!teacher) throw new NotFoundException('Teacher topilmadi');
    }

    const attendanceDate = date ?? new Date().toISOString().split('T')[0];

    type SkippedResult = {
      skipped: true;
      studentId: number;
      existing: Attendance;
    };
    type CreatedResult = Attendance;
    const results: (SkippedResult | CreatedResult)[] = [];

    for (const { studentId, status } of students) {
      const student = await this.studentRepo.findOne({
        where: { id: studentId },
      });
      if (!student)
        throw new NotFoundException(`Student topilmadi (id: ${studentId})`);

      const existing = await this.attendanceRepo
        .createQueryBuilder('attendance')
        .leftJoin('attendance.group', 'group')
        .leftJoin('attendance.student', 'student')
        .where('group.id = :groupId', { groupId })
        .andWhere('student.id = :studentId', { studentId })
        .andWhere('attendance.date = :attendanceDate', { attendanceDate })
        .getOne();

      if (existing) {
        results.push({ skipped: true, studentId, existing });
        continue;
      }

      const attendance = this.attendanceRepo.create({
        group,
        student,
        ...(teacher && { teacher }),
        date: attendanceDate,
        status, // har bir student o'z statusiga ega
      });

      const saved = await this.attendanceRepo.save(attendance);

      const full = await this.attendanceRepo.findOne({
        where: { id: saved.id },
        relations: ['group', 'student', 'teacher'],
      });

      if (full) results.push(full);
    }

    return results;
  }
  async learningCenterFindAll(learningCenterId: number) {
    return this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.group', 'group')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('student.learningCenter', 'learningCenter')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .where('learningCenter.id = :learningCenterId', { learningCenterId })
      .orderBy('attendance.date', 'DESC')
      .getMany();
  }

  async learningCenterFindOne(id: number, learningCenterId: number) {
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.group', 'group')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('student.learningCenter', 'learningCenter')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .where('attendance.id = :id', { id })
      .andWhere('learningCenter.id = :learningCenterId', { learningCenterId })
      .getOne();

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }
    return attendance;
  }

  async findAll(groupId: number) {
    return this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.group', 'group')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .where('group.id = :groupId', { groupId })
      .orderBy('attendance.date', 'DESC')
      .getMany();
  }

  async findOne(id: number, groupId: number) {
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.group', 'group')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .where('attendance.id = :id', { id })
      .andWhere('group.id = :groupId', { groupId })
      .getOne();

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }
    return attendance;
  }
  async update(updateDto: UpdateAttendanceDto, id: number) {
    const attendance = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.group', 'group')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .where('attendance.id = :id', { id })
      .getOne();

    if (!attendance) throw new NotFoundException('Attendance topilmadi');

    const { groupId, students, teacherId, date } = updateDto;

    if (groupId) {
      const group = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!group) throw new NotFoundException('Group topilmadi');
      attendance.group = group;
    }

    if (teacherId) {
      const teacher = await this.teacherRepo.findOne({
        where: { id: teacherId },
      });
      if (!teacher) throw new NotFoundException('Teacher topilmadi');
      attendance.teacher = teacher;
    }

    if (date) attendance.date = date;

    // students kelmasa — faqat bitta yozuvni yangilaymiz (date, teacher)
    if (!students || students.length === 0) {
      await this.attendanceRepo.save(attendance);
      return {
        statusCode: 200,
        message: 'Attendance updated successfully',
        data: [attendance],
      };
    }

    type SkippedResult = {
      skipped: true;
      studentId: number;
      existing: Attendance;
    };
    type UpdatedResult = Attendance;
    const results: (SkippedResult | UpdatedResult)[] = [];

    for (const { studentId, status } of students) {
      const student = await this.studentRepo.findOne({
        where: { id: studentId },
      });
      if (!student)
        throw new NotFoundException(`Student topilmadi (id: ${studentId})`);

      const newDate = date ?? attendance.date;
      const newGroupId = groupId ?? attendance.group.id;

      // Duplicate tekshiruv
      const duplicate = await this.attendanceRepo
        .createQueryBuilder('att')
        .leftJoin('att.group', 'group')
        .leftJoin('att.student', 'student')
        .where('group.id = :newGroupId', { newGroupId })
        .andWhere('student.id = :studentId', { studentId })
        .andWhere('att.date = :newDate', { newDate })
        .andWhere('att.id != :id', { id })
        .getOne();

      if (duplicate) {
        results.push({ skipped: true, studentId, existing: duplicate });
        continue;
      }

      // Mavjud attendance ni topamiz yoki yangisini yaratamiz
      let studentAttendance = await this.attendanceRepo
        .createQueryBuilder('att')
        .leftJoinAndSelect('att.group', 'group')
        .leftJoinAndSelect('att.student', 'student')
        .leftJoinAndSelect('att.teacher', 'teacher')
        .where('group.id = :newGroupId', { newGroupId })
        .andWhere('student.id = :studentId', { studentId })
        .andWhere('att.date = :newDate', { newDate })
        .getOne();

      if (!studentAttendance) {
        studentAttendance = this.attendanceRepo.create({
          group: attendance.group,
          student,
          teacher: attendance.teacher,
          date: newDate,
          status,
        });
      } else {
        studentAttendance.status = status;
        if (teacherId) studentAttendance.teacher = attendance.teacher;
      }

      const saved = await this.attendanceRepo.save(studentAttendance);
      results.push(saved);
    }

    return {
      statusCode: 200,
      message: 'Attendance updated successfully',
      data: results,
    };
  }
  async remove(id: number) {
    const attendance = await this.attendanceRepo.findOne({ where: { id } });

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }
    await this.attendanceRepo.remove(attendance);

    return {
      statusCode: 200,
      message: 'Attendance muvaffaqiyatli ochirildi',
    };
  }
}
