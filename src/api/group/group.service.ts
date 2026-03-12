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
    const groups = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.teacher', 'teacher')
      .leftJoinAndSelect('group.learningCenter', 'learningCenter')
      .leftJoinAndSelect('group.groupStudents.student', 'groupStudents.student')
      .leftJoinAndSelect('group.groupStudents', 'groupStudents')
      .where('teacher.id = :teacherId', { teacherId })
      .getMany();
    return {
      statusCode: 200,
      message: 'Guruhlar muvaffaqiyatli olingan',
      data: groups,
    };
  }

  async findByLearningCenter(learningCenterId: number) {
    const groups = await this.groupRepository
      .createQueryBuilder('groups')
      .leftJoinAndSelect('groups.teacher', 'teacher')
      .leftJoinAndSelect('groups.learningCenter', 'learningCenter')
      .leftJoinAndSelect('groups.groupStudents', 'groupStudents')
      .where('learningCenter.id = :learningCenterId', { learningCenterId })
      .getMany();
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

  async findOneByTeacher(teacherId: number, groupId: number) {
    const group = await this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.teacher', 'teacher')
      .leftJoinAndSelect('group.learningCenter', 'learningCenter')
      .leftJoinAndSelect('group.groupStudents', 'groupStudents')
      .leftJoinAndSelect('groupStudents.student', 'student')
      .where('teacher.id = :teacherId', { teacherId })
      .andWhere('group.id = :groupId', { groupId })
      .getOne();

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
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['teacher', 'learningCenter'],
    });

    if (!group) {
      throw new NotFoundException('Guruh topilmadi');
    }

    const { teacher_id, learning_center_id, ...restDto } = updateGroupDto;

    if (teacher_id !== undefined) {
      const teacher = await this.teacherRepository.findOneBy({
        id: teacher_id,
      });
      if (!teacher) throw new NotFoundException("O'qituvchi topilmadi");
      group.teacher = teacher;
    }

    if (learning_center_id !== undefined) {
      const learningCenter = await this.learningCenterRepository.findOneBy({
        id: learning_center_id,
      });
      if (!learningCenter)
        throw new NotFoundException("O'quv markazi topilmadi");
      group.learningCenter = learningCenter;
    }

    // Faqat kelgan fieldlarni yangilash
    if (restDto.name !== undefined) group.name = restDto.name;
    if (restDto.startDate !== undefined) group.startDate = restDto.startDate;
    if (restDto.endDate !== undefined) group.endDate = restDto.endDate;
    if (restDto.lessonDays !== undefined) group.lessonDays = restDto.lessonDays;
    if (restDto.lessonTime !== undefined) group.lessonTime = restDto.lessonTime;
    if (restDto.monthlyPrice !== undefined)
      group.monthlyPrice = parseFloat(String(restDto.monthlyPrice));
    if (restDto.isActive !== undefined) group.isActive = restDto.isActive;
    if (restDto.maxStudents !== undefined)
      group.maxStudents = parseInt(String(restDto.maxStudents));
    if (restDto.room !== undefined) group.room = restDto.room;
    if (restDto.description !== undefined)
      group.description = restDto.description;
    if (restDto.currentStudents !== undefined)
      group.currentStudents = parseInt(String(restDto.currentStudents));

    await this.groupRepository.save(group);

    await this.groupRepository.save(group);

    const updatedGroup = await this.groupRepository.findOne({
      where: { id },
      relations: [
        'teacher',
        'learningCenter',
        'groupStudents',
        'groupStudents.student',
      ],
    });

    return {
      statusCode: 200,
      message: 'Guruh muvaffaqiyatli yangilandi',
      data: updatedGroup,
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
