import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from '../../core/entities/lesson.entity';
import { Group } from '../../core/entities/group.entity';
import { Teacher } from '../../core/entities/teacher.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepo: Repository<Lesson>,

    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,

    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
  ) { }

  async create(dto: CreateLessonDto): Promise<Lesson> {
    const group = await this.groupRepo.findOne({
      where: { id: dto.groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const teacher = await this.teacherRepo.findOne({
      where: { id: dto.teacherId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const lesson = this.lessonRepo.create({
      name: dto.name,
      description: dto.description,
      lessonDate: dto.lessonDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      group,
      teacher,
    });

    return await this.lessonRepo.save(lesson);
  }

  async findAll(learningCenterId: number): Promise<any> {
    const lessons = await this.lessonRepo.find({
      where: {
        group: {
          learningCenter: { id: learningCenterId },
        },
      },
      relations: [
        'group',
        'group.learningCenter',
        'teacher',
        'attendances',
        'attendances.student',
        'group.groupStudents',
        'group.groupStudents.student',
      ],
      order: { lessonDate: 'ASC' },
    });

    return {
      statusCode: 200,
      message: 'Lessons fetched successfully',
      data: lessons,
    };
  }

  async findByDateRange(
    learningCenterId: number,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const lessons = await this.lessonRepo.find({
      where: {
        lessonDate: Between(startDate, endDate),
        group: {
          learningCenter: { id: learningCenterId },
        },
      },
      relations: [
        'group',
        'group.learningCenter',
        'teacher',
        'attendances',
        'attendances.student',
      ],
      order: { lessonDate: 'ASC' },
    });

    return {
      statusCode: 200,
      message: 'Lessons fetched successfully',
      data: lessons,
    };
  }

  async findOne(id: number, learningCenterId: number): Promise<any> {
    const lesson = await this.lessonRepo.findOne({
      where: {
        id,
        group: {
          learningCenter: { id: learningCenterId },
        },
      },
      relations: [
        'group',
        'group.learningCenter',
        'teacher',
        'attendances',
        'attendances.student',
        'group.groupStudents',
        'group.groupStudents.student',
      ],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return {
      statusCode: 200,
      message: 'Lesson found successfully',
      data: lesson,
    };
  }

  async update(id: number, dto: CreateLessonDto, learningCenterId: number): Promise<any> {
    // avval lesson mavjudligini tekshirish (learningCenter scope bilan)
    const lesson = await this.lessonRepo.findOne({
      where: {
        id,
        group: { learningCenter: { id: learningCenterId } },
      },
      relations: ['group', 'group.learningCenter'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // group mavjudligini tekshirish (learningCenter scope bilan)
    const group = await this.groupRepo.findOne({
      where: { id: dto.groupId, learningCenter: { id: learningCenterId } },
    });
    if (!group) throw new NotFoundException('Group not found');

    const teacher = await this.teacherRepo.findOne({
      where: { id: dto.teacherId, learningCenter: { id: learningCenterId } },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');

    Object.assign(lesson, { ...dto, group, teacher });
    const updated = await this.lessonRepo.save(lesson);

    return {
      statusCode: 200,
      message: 'Lesson updated successfully',
      data: updated,
    };
  }

  async remove(id: number, learningCenterId: number): Promise<any> {
    const lesson = await this.lessonRepo.findOne({
      where: {
        id,
        group: { learningCenter: { id: learningCenterId } },
      },
      relations: ['group', 'group.learningCenter'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    await this.lessonRepo.remove(lesson);

    return {
      statusCode: 200,
      message: 'Lesson deleted successfully',
    };
  }
}
