import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

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

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepo.find({
      relations: ['group', 'teacher'],
      order: { lessonDate: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
      relations: ['group', 'teacher'],
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async remove(id: number): Promise<{ message: string }> {
    const lesson = await this.findOne(id);
    await this.lessonRepo.remove(lesson);
    return { message: 'Lesson deleted successfully' };
  }
}