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
    const { groupId, studentId, teacherId, date, status } = dto;

    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group topilmadi');

    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student topilmadi');

    let teacher: Teacher | null = null;
    if (teacherId) {
      teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
      if (!teacher) throw new NotFoundException('Teacher topilmadi');
    }

    const attendanceDate = date ?? new Date().toISOString().split('T')[0];

    const existing = await this.attendanceRepo.findOne({
      where: {
        group: { id: groupId },
        student: { id: studentId },
        date: attendanceDate,
      },
      relations: ['group', 'student'],
    });
    const attendance = this.attendanceRepo.create({
      group,
      student,
      ...(teacher && { teacher }),
      date: attendanceDate,
      status,
    });

    const saved = await this.attendanceRepo.save(attendance);

    // Return with full relations
    return this.attendanceRepo.findOne({
      where: { id: saved.id },
      relations: ['group', 'student', 'teacher'],
    });
  }

  async learningCenterFindAll(learningCenterId: number) {
    return this.attendanceRepo.find({
      where: {
        student: { learningCenter: { id: learningCenterId } },
      },
      relations: ['group', 'student', 'student.learningCenter', 'teacher'],
      order: { date: 'DESC' },
    });
  }

  async learningCenterFindOne(id: number, learningCenterId: number) {
    const attendance = await this.attendanceRepo.findOne({
      where: {
        id,
        student: { learningCenter: { id: learningCenterId } },
      },
      relations: ['group', 'student', 'student.learningCenter', 'teacher'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }
    return attendance;
  }

  async findAll() {
    return this.attendanceRepo.find({
      relations: ['group', 'student', 'teacher'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: number) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: ['group', 'student', 'teacher'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }
    return attendance;
  }

  async update(updateDto: UpdateAttendanceDto, id: number) {
    const attendance = await this.attendanceRepo.findOne({
      where: { id },
      relations: ['group', 'student', 'teacher'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance topilmadi');
    }

    const { groupId, studentId, teacherId, date, status } = updateDto;

    if (groupId) {
      const group = await this.groupRepo.findOne({ where: { id: groupId } });
      if (!group) throw new NotFoundException('Group topilmadi');
      attendance.group = group;
    }

    if (studentId) {
      const student = await this.studentRepo.findOne({
        where: { id: studentId },
      });
      if (!student) throw new NotFoundException('Student topilmadi');
      attendance.student = student;
    }

    if (teacherId) {
      const teacher = await this.teacherRepo.findOne({
        where: { id: teacherId },
      });
      if (!teacher) throw new NotFoundException('Teacher topilmadi');
      attendance.teacher = teacher;
    }

    const newDate = date ?? attendance.date;
    const newStudentId = studentId ?? attendance.student.id;
    const newGroupId = groupId ?? attendance.group.id;

    // Check duplicate only if date, student, or group changed
    if (date || studentId || groupId) {
      const duplicate = await this.attendanceRepo.findOne({
        where: {
          group: { id: newGroupId },
          student: { id: newStudentId },
          date: newDate,
        },
        relations: ['group', 'student'],
      });

      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException(
          'Bu student uchun shu sanada davomat allaqachon mavjud',
        );
      }
    }

    attendance.date = newDate;
    attendance.status = status ?? attendance.status;

    await this.attendanceRepo.save(attendance);

    return {
      statusCode: 200,
      message: 'Attendance updated successfully',
      data: attendance,
    };
  }

  async remove(id: number) {
    const attendance = await this.findOne(id);
    await this.attendanceRepo.remove(attendance);

    return {
      statusCode: 200,
      message: 'Attendance muvaffaqiyatli ochirildi',
    };
  }
}
