import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '../../core/entities/student.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group } from '../../core/entities/group.entity';
import { LearningCenter } from '../../core/entities/learning_center.entity';
import { GroupStudent } from '../../core/entities/group_student.entity';
import { GroupStudentStatus } from '../../common/enum';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentRepository: Repository<Student>,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(LearningCenter)
    private learningCenterRepository: Repository<LearningCenter>,
    @InjectRepository(GroupStudent)
    private groupStudentRepository: Repository<GroupStudent>,
    private dataSource: DataSource, // Transaction uchun
  ) {}

  async create(createStudentDto: CreateStudentDto) {
    const {
      fullName,
      phone,
      parentPhone,
      birthDate,
      learningCenterId,
      address,
      groupId,
    } = createStudentDto;

    // Transaction bilan ishlash
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // O'quv markazi mavjudligini tekshirish
      const learningCenter = await queryRunner.manager.findOne(LearningCenter, {
        where: { id: learningCenterId },
      });
      // O'quv markazi topilmasa, NotFoundException tashlash
      if (!learningCenter) {
        throw new NotFoundException("O'quv markazi topilmadi");
      }

      // Guruh mavjudligini tekshirish
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
        relations: ['groupStudents'], // O'quvchilar sonini bilish uchun
      });

      // Guruh topilmasa, NotFoundException tashlash
      if (!group) {
        throw new NotFoundException('Guruh topilmadi');
      }

      // Telefon raqami ota-ona telefon raqamidan farq qilishi kerak
      if (phone === parentPhone) {
        throw new BadRequestException(
          "O'quvchining telefon raqami ota-ona telefon raqamidan farq qilishi kerak",
        );
      }

      // Guruhdagi o'quvchilar sonini tekshirish
      if (
        group.groupStudents &&
        group.groupStudents.length >= group.maxStudents
      ) {
        throw new BadRequestException(
          "Guruh to'lgan, yangi o'quvchi qo'shib bo'lmaydi",
        );
      }

      // 1. Student yaratish
      const student = queryRunner.manager.create(Student, {
        fullName,
        phone,
        parentPhone,
        birthDate,
        learningCenter: learningCenter,
        address,
        isActive: true,
      });

      const savedStudent = await queryRunner.manager.save(student);

      // 2. GroupStudent yaratish (bog'lanish)
      const groupStudent = queryRunner.manager.create(GroupStudent, {
        group: group,
        student: savedStudent,
        joinedAt: new Date().toISOString().split('T')[0],
        status: GroupStudentStatus.ACTIVE,
      });

      await queryRunner.manager.save(groupStudent);

      // 3. Guruhdagi currentStudents sonini yangilash
      const currentStudentsCount = group.groupStudents
        ? group.groupStudents.length + 1
        : 1;
      await queryRunner.manager.update(Group, group.id, {
        currentStudents: currentStudentsCount,
      });

      // Transactionni commit qilish
      await queryRunner.commitTransaction();

      // O'quvchini guruhlari bilan qaytarish
      const savedStudentWithRelations = await this.studentRepository.findOne({
        where: { id: savedStudent.id },
        relations: ['groupStudents', 'groupStudents.group', 'learningCenter'],
      });

      return {
        statusCode: 201,
        message: "O'quvchi muvaffaqiyatli yaratildi",
        data: savedStudentWithRelations,
      };
    } catch (error) {
      // Xatolik bo'lsa transactionni rollback qilish
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // QueryRunnerni release qilish
      await queryRunner.release();
    }
  }

  async findAll() {
    const students = await this.studentRepository.find({
      relations: [
        'groupStudents',
        'groupStudents.group',
        'learningCenter',
        'payments',
      ],
    });

    return {
      statusCode: 200,
      message: "Barcha o'quvchilar muvaffaqiyatli topildi",
      data: students,
    };
  }

  async findOne(id: number) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: [
        'groupStudents',
        'groupStudents.group',
        'learningCenter',
        'payments',
        'attendances',
      ],
    });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    return {
      statusCode: 200,
      message: "O'quvchi muvaffaqiyatli topildi",
      data: student,
    };
  }

  async addStudentToGroup(studentId: number, groupId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // O'quvchini tekshirish
      const student = await queryRunner.manager.findOne(Student, {
        where: { id: studentId },
      });

      if (!student) {
        throw new NotFoundException("O'quvchi topilmadi");
      }

      // Guruhni tekshirish
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
        relations: ['groupStudents'],
      });

      if (!group) {
        throw new NotFoundException('Guruh topilmadi');
      }

      // O'quvchi allaqachon guruhga qo'shilganligini tekshirish
      const existingGroupStudent = await queryRunner.manager.findOne(
        GroupStudent,
        {
          where: {
            student: { id: studentId },
            group: { id: groupId },
          },
        },
      );

      if (existingGroupStudent) {
        throw new ConflictException(
          "O'quvchi allaqachon bu guruhga qo'shilgan",
        );
      }

      // Guruhdagi o'quvchilar sonini tekshirish
      if (
        group.groupStudents &&
        group.groupStudents.length >= group.maxStudents
      ) {
        throw new BadRequestException(
          "Guruh to'lgan, yangi o'quvchi qo'shib bo'lmaydi",
        );
      }

      // GroupStudent yaratish
      const groupStudent = queryRunner.manager.create(GroupStudent, {
        group: group,
        student: student,
        joinedAt: new Date().toISOString().split('T')[0],
        status: GroupStudentStatus.ACTIVE,
      });

      await queryRunner.manager.save(groupStudent);

      // Guruhdagi currentStudents sonini yangilash
      await queryRunner.manager.update(Group, group.id, {
        currentStudents: group.groupStudents.length + 1,
      });

      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: "O'quvchi guruhga muvaffaqiyatli qo'shildi",
        data: groupStudent,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async removeStudentFromGroup(studentId: number, groupId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // GroupStudent ni topish
      const groupStudent = await queryRunner.manager.findOne(GroupStudent, {
        where: {
          student: { id: studentId },
          group: { id: groupId },
        },
        relations: ['group'],
      });

      if (!groupStudent) {
        throw new NotFoundException("O'quvchi bu guruhga qo'shilmagan");
      }

      // Statusni o'zgartirish
      groupStudent.status = GroupStudentStatus.ACTIVE;
      groupStudent.leftAt = new Date().toISOString().split('T')[0];
      await queryRunner.manager.save(groupStudent);

      // Guruhdagi currentStudents sonini yangilash
      const group = await queryRunner.manager.findOne(Group, {
        where: { id: groupId },
        relations: ['groupStudents'],
      });

      if (!group) {
        throw new NotFoundException('Guruh topilmadi');
      }

      const activeStudents = group.groupStudents.filter(
        (gs) => gs.status === GroupStudentStatus.ACTIVE,
      ).length;

      await queryRunner.manager.update(Group, group.id, {
        currentStudents: activeStudents,
      });

      await queryRunner.commitTransaction();

      return {
        statusCode: 200,
        message: "O'quvchi guruhdan muvaffaqiyatli chiqarildi",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, updateStudentDto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['learningCenter'],
    });

    if (!student) {
      throw new NotFoundException("O'quvchi topilmadi");
    }

    // Telefon raqami o'zgartirilayotgan bo'lsa, unikal ekanligini tekshirish
    if (updateStudentDto.phone && updateStudentDto.phone !== student.phone) {
      const existingPhone = await this.studentRepository.findOne({
        where: { phone: updateStudentDto.phone },
      });
      if (existingPhone) {
        throw new ConflictException(
          "Bu telefon raqami bilan o'quvchi allaqachon mavjud",
        );
      }
    }

    // Ota-ona telefon raqami o'zgartirilayotgan bo'lsa, unikal ekanligini tekshirish
    if (
      updateStudentDto.parentPhone &&
      updateStudentDto.parentPhone !== student.parentPhone
    ) {
      const existingParentPhone = await this.studentRepository.findOne({
        where: { parentPhone: updateStudentDto.parentPhone },
      });
      if (existingParentPhone) {
        throw new ConflictException(
          "Bu ota-ona telefon raqami bilan o'quvchi allaqachon mavjud",
        );
      }
    }

    // Telefon va ota-ona telefoni tengligini tekshirish
    if (
      updateStudentDto.phone &&
      updateStudentDto.parentPhone &&
      updateStudentDto.phone === updateStudentDto.parentPhone
    ) {
      throw new BadRequestException(
        "O'quvchining telefon raqami ota-ona telefon raqamidan farq qilishi kerak",
      );
    }

    Object.assign(student, updateStudentDto);
    const updatedStudent = await this.studentRepository.save(student);

    return {
      statusCode: 200,
      message: "O'quvchi muvaffaqiyatli yangilandi",
      data: updatedStudent,
    };
  }

  async remove(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const student = await queryRunner.manager.findOne(Student, {
        where: { id },
        relations: ['groupStudents'],
      });

      if (!student) {
        throw new NotFoundException("O'quvchi topilmadi");
      }

      // O'quvchini o'chirish (groupStudents CASCADE delete bilan o'chadi)
      await queryRunner.manager.remove(student);

      await queryRunner.commitTransaction();

      return {
        statusCode: 200,
        message: "O'quvchi muvaffaqiyatli o'chirildi",
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
