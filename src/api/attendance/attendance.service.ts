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
import { Lesson } from '../../core/entities/lesson.entity';

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

    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,
  ) {}

 async create(dto: CreateAttendanceDto) {
  const { groupId, students, teacherId, date, lessonId } = dto;

  // ✅ Barcha asosiy entitylarni oldin tekshiramiz
  const [lesson, group] = await Promise.all([
    this.lessonRepo.findOne({ where: { id: lessonId } }),
    this.groupRepo.findOne({ where: { id: groupId } }),
  ]);

  if (!lesson) throw new NotFoundException('Lesson topilmadi');
  if (!group) throw new NotFoundException('Group topilmadi');

  // ✅ Lesson groupga tegishli ekanligini tekshiramiz
  if (lesson.group?.id && lesson.group.id !== groupId) {
    throw new BadRequestException('Bu lesson ushbu groupga tegishli emas');
  }

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
    if (!student) {
      throw new NotFoundException(`Student topilmadi (id: ${studentId})`);
    }

    // ✅ Lesson + student kombinatsiyasi ham tekshiriladi (duplikat oldini olish)
    const existing = await this.attendanceRepo
      .createQueryBuilder('attendance')
      .leftJoin('attendance.group', 'group')
      .leftJoin('attendance.student', 'student')
      .leftJoin('attendance.lesson', 'lesson')
      .where('group.id = :groupId', { groupId })
      .andWhere('student.id = :studentId', { studentId })
      .andWhere('lesson.id = :lessonId', { lessonId })
      .andWhere('attendance.date = :attendanceDate', { attendanceDate })
      .getOne();

    if (existing) {
      results.push({ skipped: true, studentId, existing });
      continue;
    }

    const attendance = this.attendanceRepo.create({
      group,
      student,
      lesson,           // ✅ lesson to'g'ri saqlanadi
      date: attendanceDate,
      status,
      ...(teacher && { teacher }),
    });

    const saved = await this.attendanceRepo.save(attendance);

    // ✅ Barcha relationlar bilan qaytaramiz
    const full = await this.attendanceRepo.findOne({
      where: { id: saved.id },
      relations: ['group', 'student', 'teacher', 'lesson'],
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
    .leftJoinAndSelect('attendance.lesson', 'lesson') // ✅ lesson qo'shildi
    .where('attendance.id = :id', { id })
    .getOne();

  if (!attendance) throw new NotFoundException('Attendance topilmadi');

  const { groupId, students, teacherId, date, lessonId } = updateDto;

  // ✅ Group yangilanishi
  if (groupId) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group) throw new NotFoundException('Group topilmadi');
    attendance.group = group;
  }

  // ✅ Teacher yangilanishi
  if (teacherId) {
    const teacher = await this.teacherRepo.findOne({ where: { id: teacherId } });
    if (!teacher) throw new NotFoundException('Teacher topilmadi');
    attendance.teacher = teacher;
  }

  // ✅ Lesson yangilanishi
  let lesson = attendance.lesson;
  if (lessonId) {
    const foundLesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
      relations: ['group'],
    });
    if (!foundLesson) throw new NotFoundException('Lesson topilmadi');

    // Lesson ushbu groupga tegishli ekanligini tekshiramiz
    const currentGroupId = groupId ?? attendance.group?.id;
    if (foundLesson.group?.id && foundLesson.group.id !== currentGroupId) {
      throw new BadRequestException('Bu lesson ushbu groupga tegishli emas');
    }

    lesson = foundLesson;
    attendance.lesson = lesson;
  }

  if (date) attendance.date = date;

  // Students kelmasa — faqat asosiy yozuvni yangilaymiz
  if (!students || students.length === 0) {
    const saved = await this.attendanceRepo.save(attendance);
    return {
      statusCode: 200,
      message: 'Attendance updated successfully',
      data: [saved],
    };
  }

  type SkippedResult = { skipped: true; studentId: number; existing: Attendance };
  type UpdatedResult = Attendance;
  const results: (SkippedResult | UpdatedResult)[] = [];

  const newDate = date ?? attendance.date;
  const newGroupId = groupId ?? attendance.group.id;
  const newLessonId = lessonId ?? lesson?.id;

  for (const { studentId, status } of students) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student topilmadi (id: ${studentId})`);
    }

    // ✅ Duplicate tekshiruv: lessonId ham hisobga olinadi, o'zini chiqarib tashlaymiz
    const duplicate = await this.attendanceRepo
      .createQueryBuilder('att')
      .leftJoin('att.group', 'group')
      .leftJoin('att.student', 'student')
      .leftJoin('att.lesson', 'lesson')
      .where('group.id = :newGroupId', { newGroupId })
      .andWhere('student.id = :studentId', { studentId })
      .andWhere('att.date = :newDate', { newDate })
      .andWhere('lesson.id = :newLessonId', { newLessonId })
      .andWhere('att.id != :id', { id }) // ✅ o'zini chiqarib tashlaydi
      .getOne();

    if (duplicate) {
      results.push({ skipped: true, studentId, existing: duplicate });
      continue;
    }

    // ✅ Mavjud attendance ni topamiz (shu student + group + lesson + date)
    let studentAttendance = await this.attendanceRepo
      .createQueryBuilder('att')
      .leftJoinAndSelect('att.group', 'group')
      .leftJoinAndSelect('att.student', 'student')
      .leftJoinAndSelect('att.teacher', 'teacher')
      .leftJoinAndSelect('att.lesson', 'lesson')
      .where('group.id = :newGroupId', { newGroupId })
      .andWhere('student.id = :studentId', { studentId })
      .andWhere('att.date = :newDate', { newDate })
      .andWhere('lesson.id = :newLessonId', { newLessonId })
      .getOne();

    if (!studentAttendance) {
      // ✅ Yangi yaratilganda lesson ham saqlanadi
      studentAttendance = this.attendanceRepo.create({
        group: attendance.group,
        student,
        teacher: attendance.teacher ?? undefined,
        lesson: lesson ?? undefined,
        date: newDate,
        status,
      });
    } else {
      // ✅ Mavjud yozuvni yangilaymiz
      studentAttendance.status = status;
      if (teacherId) studentAttendance.teacher = attendance.teacher;
      if (lessonId) studentAttendance.lesson = lesson;
    }

    const saved = await this.attendanceRepo.save(studentAttendance);

    // ✅ To'liq relationlar bilan qaytaramiz
    const full = await this.attendanceRepo.findOne({
      where: { id: saved.id },
      relations: ['group', 'student', 'teacher', 'lesson'],
    });

    if (full) results.push(full);
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
