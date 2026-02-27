import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLearningCenterDto } from './dto/create-learning_center.dto';
import { UpdateLearningCenterDto } from './dto/update-learning_center.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { Repository } from 'typeorm';
import { FileService } from '../file/file.service';

@Injectable()
export class LearningCenterService {
  constructor(
    @InjectRepository(LearningCenter) 
    private readonly learningCenterRepository: Repository<LearningCenter>,
    private readonly fileService: FileService
  ) {}



  async findLearningCenterStudents(learningCenterId: number) {
    const students = await this.learningCenterRepository
      .createQueryBuilder('learningCenter')
      // O'quvchini guruhlari va o'quv markazi bilan birga olish
      .leftJoinAndSelect('learningCenter.students', 'student')
      // Guruh ma'lumotlarini olish (masalan, guruh nomi)
      .leftJoinAndSelect('student.groupStudents', 'groupStudent')
      // Guruh ma'lumotlarini olish (masalan, guruh nomi)
      .leftJoinAndSelect('groupStudent.group', 'group')
      // O'quv markazi ma'lumotlarini olish
      .leftJoinAndSelect('student.learningCenter', 'learningCenter')
      // O'quv markaziga tegishli o'quvchilarni filtrlash
      .where('student.learningCenter.id = :learningCenterId', {
        learningCenterId,
      })
      // O'quvchilarni ID bo'yicha tartiblash
      .orderBy('student.id', 'ASC')
      // Natijalarni olish
      .getMany();

    
    return {
      statusCode: 200,
      message: "O'quv markaziga tegishli o'quvchilar muvaffaqiyatli topildi",
      data: students,
    };
  }

  async getTeachersByLearningCenter(learningCenterId: number) {
    // O'quv markaziga tegishli o'qituvchilarni olish
    const teachers = await this.learningCenterRepository
      .createQueryBuilder('learningCenter')
      // O'qituvchi ma'lumotlarini olish
      .leftJoinAndSelect('learningCenter.teachers', 'teacher')
      // O'quv markazi bo'yicha filtrlash
      .where('teacher.learningCenter.id = :learningCenterId', {
        learningCenterId,
      })
      // O'qituvchilarni ID bo'yicha tartiblash
      .orderBy('teacher.id', 'ASC')
      // Natijalarni olish
      .getMany();
    return {
      statusCode: 200,
      message: "O'quv markaziga tegishli o'qituvchilar muvaffaqiyatli topildi",
      data: teachers,
    };
  }



  async deleteProfileImage(lerningCenterId: number) {
    const lerningCenter = await this.learningCenterRepository.findOne({
      where: { id: lerningCenterId },
    });
    if(!lerningCenter){ throw new NotFoundException('User not found') }
    if(lerningCenter.image){
      await this.fileService.deleteFile(lerningCenter.image);
      lerningCenter.image = "";
      await this.learningCenterRepository.save(lerningCenter);
      return {
        success: true,
        message: 'Profile image deleted successfully',
      }
    } else {
      return {
        success: false,
        message: 'Profile image not found',
      }
    }
  }
}
