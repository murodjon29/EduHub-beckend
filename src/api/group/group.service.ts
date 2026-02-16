import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../../core/entities/group.entity';
import { Repository } from 'typeorm';
import { Teacher } from '../../core/entities/teacher.entity';
import { LearningCenter } from '../../core/entities/learning_center.entity';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    @InjectRepository(LearningCenter)
    private readonly learningCenterRepository: Repository<LearningCenter>,
  ) {}

  async create(createGroupDto: CreateGroupDto) {
    const { teacher_id, learning_center_id } = createGroupDto;
    const teacher = await this.teacherRepository.findOne({
      where: { id: teacher_id },
    });
    const learningCenter = await this.learningCenterRepository.findOne({
      where: { id: learning_center_id },
    });

    if (!teacher) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }
    if (!learningCenter) {
      throw new NotFoundException("O'quv markazi topilmadi");
    }

    const group = this.groupRepository.create(createGroupDto);
    group.teacher = teacher;
    group.learningCenter = learningCenter;
    await this.groupRepository.save(group);
    return {
      statusCode: 201,
      message: 'Guruh muvaffaqiyatli yaratildi',
      data: group,
    };
  }

  async findAll() {
    const groups = await this.groupRepository.find({
      relations: ['teacher', 'learningCenter', 'groupStudents'],
    });
    return {
      statusCode: 200,
      message: 'Guruhlar muvaffaqiyatli olingan',
      data: groups,
    };
  }

  async findByTeacher(teacherId: number) {
    const groups = await this.groupRepository.find({
      where: { teacher: { id: teacherId } },
      relations: ['teacher', 'learningCenter', 'groupStudents'],
    });
    return {
      statusCode: 200,
      message: 'Guruhlar muvaffaqiyatli olingan',
      data: groups,
    };
  }

  async findByLearningCenter(learningCenterId: number) {
    const groups = await this.groupRepository.find({
      where: { learningCenter: { id: learningCenterId } },
      relations: ['teacher', 'learningCenter', 'groupStudents.student'],
    });
    return {
      statusCode: 200,
      message: 'Guruhlar muvaffaqiyatli olingan',
      data: groups,
    };
  }

  async findOne(id: number) {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['teacher', 'learningCenter', 'groupStudents.student'],
    });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    return {
      statusCode: 200,
      message: 'Guruh muvaffaqiyatli olingan',
      data: group,
    };
  }

  async update(id: number, updateGroupDto: UpdateGroupDto) {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    if (
      !(await this.teacherRepository.findOne({
        where: { id: updateGroupDto.teacher_id },
      }))
    ) {
      throw new NotFoundException("O'qituvchi topilmadi");
    }
    if (
      !(await this.learningCenterRepository.findOne({
        where: { id: updateGroupDto.learning_center_id },
      }))
    ) {
      throw new NotFoundException("O'quv markazi topilmadi");
    }
    Object.assign(group, updateGroupDto);
    await this.groupRepository.save(group);
    return {
      statusCode: 200,
      message: 'Guruh muvaffaqiyatli yangilandi',
      data: group,
    };
  }

  async remove(id: number) {
    const group = await this.groupRepository.findOne({ where: { id } });
    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }
    await this.groupRepository.remove(group);
    return { statusCode: 200, message: "Guruh muvaffaqiyatli o'chirildi" };
  }
}
