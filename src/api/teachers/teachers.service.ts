import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Brackets, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { TeacherStatisticsQueryDto } from './dto/teacher-statistics-query.dto';
import { TeacherLoginDto } from './dto/teacher-login.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { AttendanceStatus, GroupStudentStatus } from '../../common/enum';
import { Attendance } from '../../core/entities/attendance.entity';
import { Group } from '../../core/entities/group.entity';
import { GroupStudent } from '../../core/entities/group_student.entity';
import { Lesson } from '../../core/entities/lesson.entity';
import { Teacher } from '../../core/entities/teacher.entity';
import { BcryptManage } from '../../infrastructure/lib/bcrypt';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupStudent)
    private readonly groupStudentRepository: Repository<GroupStudent>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly bcrypt: BcryptManage,
    private readonly jwt: JwtService,
  ) {}

  async create(createTeacherDto: CreateTeacherDto) {
    const {
      email,
      name,
      lastName,
      phone,
      salary,
      password,
      login,
      learningCenterId,
      subject,
    } = createTeacherDto;

    const learningCenter = await this.teacherRepository.manager.findOne(
      'learning_centers',
      { where: { id: learningCenterId } },
    );

    if (!learningCenter) {
      throw new NotFoundException("O'quv markazi topilmadi");
    }

    if (await this.teacherRepository.findOne({ where: { login } })) {
      throw new ConflictException(
        "Bu login bilan o'qituvchi allaqachon mavjud",
      );
    }

    const hashedPassword = await this.bcrypt.createBcryptPassword(password);
    const teacher = this.teacherRepository.create({
      name,
      lastName,
      phone,
      salary,
      password: hashedPassword,
      email,
      login,
      subject,
      learningCenter,
    });

    await this.teacherRepository.save(teacher);

    return {
      statusCode: 201,
      message: "O'qituvchi muvaffaqiyatli yaratildi",
      data: teacher,
    };
  }

  async login(dto: TeacherLoginDto, res: Response) {
    const { login, password } = dto;
    const teacher = await this.teacherRepository.findOne({ where: { login } });

    if (!teacher) {
      throw new NotFoundException("Login noto'g'ri");
    }

    const isPasswordValid = await this.bcrypt.comparePassword(
      password,
      teacher.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException("Parol noto'g'ri");
    }

    const payload = {
      id: teacher.id,
      login: teacher.login,
      role: teacher.role,
    };

    const access_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    const refresh_token = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '30d',
    });

    await this.writeToCookie(refresh_token, res);

    return {
      statusCode: 200,
      message: 'Tizimga muvaffaqiyatli kirdingiz',
      data: {
        access_token,
        refresh_token,
        teacher,
      },
    };
  }

  async refreshToken(oldRefreshToken: string, res: Response) {
    try {
      const payload = await this.jwt.verifyAsync(oldRefreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newPayload = {
        id: payload.id,
        login: payload.login,
        role: payload.role,
      };

      const accessToken = await this.jwt.signAsync(newPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
      });

      const refreshToken = await this.jwt.signAsync(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '30d',
      });

      await this.writeToCookie(refreshToken, res);

      return {
        statusCode: 200,
        message: 'Token muvaffaqiyatli yangilandi',
        data: {
          accessToken,
          refreshToken,
        },
      };
    } catch {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  async logout(res: Response) {
    try {
      res.clearCookie('refresh_token');

      return {
        statusCode: 200,
        message: 'Tizimdan muvaffaqiyatli chiqildi',
      };
    } catch (error) {
      throw new BadRequestException(`Error on logout: ${error}`);
    }
  }

  async filterTeacher(search: string, learningCenterId: number) {
    const teachers = await this.teacherRepository
      .createQueryBuilder('teacher')
      .where('teacher.learningCenterId = :learningCenterId', {
        learningCenterId,
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('teacher.name ILIKE :search', { search: `%${search}%` })
            .orWhere('teacher.lastName ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('teacher.email ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('teacher.phone ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('teacher.subject ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      )
      .getMany();

    return {
      statusCode: 200,
      message: 'Qidiruv natijalari',
      data: teachers,
    };
  }

  async statistics(id: number, query: TeacherStatisticsQueryDto) {
    const teacher = await this.teacherRepository.findOne({
      where: { id },
      relations: ['learningCenter'],
    });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    const { startDate, endDate } = this.normalizeDateRange(query);
    const today = new Date().toISOString().split('T')[0];

    const groupCount = await this.groupRepository.count({
      where: { teacher: { id } },
    });

    const activeGroupCount = await this.groupRepository.count({
      where: {
        teacher: { id },
        isActive: true,
      },
    });

    const studentCountResult = await this.groupStudentRepository
      .createQueryBuilder('groupStudent')
      .leftJoin('groupStudent.group', 'group')
      .leftJoin('group.teacher', 'teacher')
      .where('teacher.id = :id', { id })
      .andWhere('groupStudent.status = :status', {
        status: GroupStudentStatus.ACTIVE,
      })
      .select('COUNT(DISTINCT groupStudent.student_id)', 'count')
      .getRawOne<{ count: string }>();

    const lessonStatsQuery = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoin('lesson.teacher', 'teacher')
      .where('teacher.id = :id', { id });

    if (startDate) {
      lessonStatsQuery.andWhere('lesson.lessonDate >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      lessonStatsQuery.andWhere('lesson.lessonDate <= :endDate', {
        endDate,
      });
    }

    const lessonStats = await lessonStatsQuery
      .select('COUNT(lesson.id)', 'totalLessons')
      .addSelect(
        'COUNT(CASE WHEN lesson.lessonDate = :today THEN 1 END)',
        'todayLessons',
      )
      .addSelect(
        'COUNT(CASE WHEN lesson.lessonDate > :today THEN 1 END)',
        'upcomingLessons',
      )
      .setParameter('today', today)
      .getRawOne<{
        totalLessons: string;
        todayLessons: string;
        upcomingLessons: string;
      }>();

    const attendanceStatsQuery = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoin('attendance.teacher', 'teacher')
      .leftJoin('attendance.lesson', 'lesson')
      .leftJoin('lesson.teacher', 'lessonTeacher')
      .where(
        new Brackets((qb) => {
          qb.where('teacher.id = :id', { id }).orWhere(
            'lessonTeacher.id = :id',
            { id },
          );
        }),
      );

    if (startDate) {
      attendanceStatsQuery.andWhere('attendance.date >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      attendanceStatsQuery.andWhere('attendance.date <= :endDate', {
        endDate,
      });
    }

    const attendanceStats = await attendanceStatsQuery
      .select('COUNT(attendance.id)', 'totalRecords')
      .addSelect(
        'COUNT(CASE WHEN attendance.status = :presentStatus THEN 1 END)',
        'presentCount',
      )
      .addSelect(
        'COUNT(CASE WHEN attendance.status = :absentStatus THEN 1 END)',
        'absentCount',
      )
      .setParameter('presentStatus', AttendanceStatus.PRESENT)
      .setParameter('absentStatus', AttendanceStatus.ABSENT)
      .getRawOne<{
        totalRecords: string;
        presentCount: string;
        absentCount: string;
      }>();

    const recentLessonsQuery = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.group', 'group')
      .leftJoin('lesson.teacher', 'teacher')
      .where('teacher.id = :id', { id });

    if (startDate) {
      recentLessonsQuery.andWhere('lesson.lessonDate >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      recentLessonsQuery.andWhere('lesson.lessonDate <= :endDate', {
        endDate,
      });
    }

    const recentLessons = await recentLessonsQuery
      .orderBy('lesson.lessonDate', 'DESC')
      .addOrderBy('lesson.startTime', 'DESC')
      .take(5)
      .getMany();

    const totalRecords = Number(attendanceStats?.totalRecords ?? 0);
    const presentCount = Number(attendanceStats?.presentCount ?? 0);
    const absentCount = Number(attendanceStats?.absentCount ?? 0);

    return {
      statusCode: 200,
      message: "O'qituvchi statistikasi muvaffaqiyatli olindi",
      data: {
        teacher: {
          id: teacher.id,
          name: teacher.name,
          lastName: teacher.lastName,
          subject: teacher.subject,
          salary: Number(teacher.salary),
          learningCenterId: teacher.learningCenter?.id ?? null,
        },
        period: {
          startDate: startDate ?? null,
          endDate: endDate ?? null,
        },
        overview: {
          groupCount,
          activeGroupCount,
          studentCount: Number(studentCountResult?.count ?? 0),
          lessonCount: Number(lessonStats?.totalLessons ?? 0),
          todayLessons: Number(lessonStats?.todayLessons ?? 0),
          upcomingLessons: Number(lessonStats?.upcomingLessons ?? 0),
        },
        attendance: {
          totalRecords,
          presentCount,
          absentCount,
          attendanceRate:
            totalRecords > 0
              ? Number(((presentCount / totalRecords) * 100).toFixed(2))
              : 0,
        },
        recentLessons: recentLessons.map((lesson) => ({
          id: lesson.id,
          name: lesson.name,
          lessonDate: lesson.lessonDate,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          group: lesson.group
            ? {
                id: lesson.group.id,
                name: lesson.group.name,
              }
            : null,
        })),
      },
    };
  }

  async findAll() {
    const teachers = await this.teacherRepository.find();
    return {
      statusCode: 200,
      message: "O'qituvchilar muvaffaqiyatli topildi",
      data: teachers,
    };
  }

  async findOne(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });
    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }
    return {
      statusCode: 200,
      message: "O'qituvchi muvaffaqiyatli topildi",
      data: teacher,
    };
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto) {
    const { learningCenterId } = updateTeacherDto;

    if (learningCenterId) {
      const learningCenter = await this.teacherRepository.manager.findOne(
        'learning_centers',
        { where: { id: learningCenterId } },
      );

      if (!learningCenter) {
        throw new NotFoundException("O'quv markazi topilmadi");
      }
    }

    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    if (
      updateTeacherDto.login &&
      (await this.teacherRepository.findOne({
        where: { login: updateTeacherDto.login },
      }))
    ) {
      throw new ConflictException(
        "Bu login bilan o'qituvchi allaqachon mavjud",
      );
    }

    if (updateTeacherDto.password) {
      updateTeacherDto.password = await this.bcrypt.createBcryptPassword(
        updateTeacherDto.password,
      );
    }

    const updatedTeacher = Object.assign(teacher, updateTeacherDto);
    await this.teacherRepository.save(updatedTeacher);

    return {
      statusCode: 200,
      message: "O'qituvchi muvaffaqiyatli yangilandi",
      data: updatedTeacher,
    };
  }

  async remove(id: number) {
    const teacher = await this.teacherRepository.findOne({ where: { id } });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }

    await this.teacherRepository.remove(teacher);

    return {
      statusCode: 200,
      message: "O'qituvchi muvaffaqiyatli o'chirildi",
    };
  }

  private async writeToCookie(refresh_token: string, res: Response) {
    try {
      res.cookie('refresh_token', refresh_token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
    } catch (error) {
      throw new BadRequestException(`Error on write to cookie: ${error}`);
    }
  }

  private normalizeDateRange(query: TeacherStatisticsQueryDto) {
    const { startDate, endDate } = query;

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException(
        'Boshlanish sanasi tugash sanasidan katta bo‘lishi mumkin emas',
      );
    }

    return { startDate, endDate };
  }
}
