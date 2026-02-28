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

    const group = await this.groupRepo.findOne({
      where: { id: groupId },
    });
    if (!group) throw new NotFoundException('Group topilmadi');

    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student topilmadi');

    let teacher: Teacher | null = null;
    if (teacherId) {
      teacher = await this.teacherRepo.findOne({
        where: { id: teacherId },
      });
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

    if (existing) {
      throw new BadRequestException(
        'Bu student uchun shu sanada davomat allaqachon mavjud',
      );
    }

    const attendance = this.attendanceRepo.create({
      group,
      student,
      ...(teacher && { teacher }),
      date: attendanceDate,
      status,
    });

    return this.attendanceRepo.save(attendance);
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

  async remove(id: number) {
    const attendance = await this.findOne(id);
    return this.attendanceRepo.remove(attendance);
  }
}
