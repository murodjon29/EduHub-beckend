import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLearningCenterDto } from './dto/create-learning_center.dto';
import { UpdateLearningCenterDto } from './dto/update-learning_center.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { Repository } from 'typeorm';
import { FileService } from '../file/file.service';
import { Student } from '../../core/entities/student.entity';
import { Teacher } from '../../core/entities/teacher.entity';

@Injectable()
export class LearningCenterService {
  constructor(
    @InjectRepository(LearningCenter)
    private readonly learningCenterRepository: Repository<LearningCenter>,
    private readonly fileService: FileService,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async findLearningCenterStudents(learningCenterId: number) {
    const students = await this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.groupStudents', 'groupStudent')
      .leftJoinAndSelect('groupStudent.group', 'group')
      .leftJoinAndSelect('student.learningCenter', 'learningCenter')
      .where('student.learningCenterId = :learningCenterId', {
        learningCenterId,
      })
      .orderBy('student.id', 'ASC')
      .getMany();

    if (!students.length) {
      throw new NotFoundException("O'quvchilar topilmadi");
    }

    return {
      statusCode: 200,
      message: "O'quvchilar muvaffaqiyatli topildi",
      data: students,
    };
  }

  async getTeachersByLearningCenter(learningCenterId: number) {
    const teachers = await this.teacherRepository
      .createQueryBuilder('teacher')
      .where('teacher.learningCenterId = :learningCenterId', {
        learningCenterId,
      })
      .orderBy('teacher.id', 'ASC')
      .getMany();

    if (!teachers.length) {
      throw new NotFoundException("O'qituvchilar topilmadi");
    }

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
}
