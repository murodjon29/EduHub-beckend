// src/students/students.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AddStudentToGroupDto } from './dto/add-student-to-group.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { AdminRoles, Role } from '../../common/enum';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "Yangi o'quvchi qo'shish",
    description: "Yangi o'quvchi ma'lumotlarini kiritish va guruhga qo'shish",
  })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    description: "O'quvchi muvaffaqiyatli yaratildi",
    schema: {
      example: {
        statusCode: 201,
        message: "O'quvchi muvaffaqiyatli yaratildi",
        data: {
          id: 1,
          fullName: 'Aliyev Alisher',
          phone: '+998901234567',
          parentPhone: '+998901234568',
          birthDate: '2010-05-15',
          address: 'Toshkent, Chilonzor tumani',
          isActive: true,
          learningCenterId: 1,
          createdAt: '2024-01-15T10:30:00.000Z',
          groupStudents: [
            {
              id: 1,
              group: {
                id: 1,
                name: 'Ingliz tili Beginner 2024',
                subject: 'Ingliz tili',
              },
              joinedAt: '2024-01-15',
              status: 'active',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Bad Request - Telefon raqamlari teng yoki guruh to'lgan",
    schema: {
      example: {
        statusCode: 400,
        message:
          "O'quvchining telefon raqami ota-ona telefon raqamidan farq qilishi kerak",
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Not Found - O'quv markazi yoki guruh topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quv markazi topilmadi",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Telefon raqami allaqachon mavjud',
    schema: {
      example: {
        statusCode: 409,
        message: "Bu telefon raqami bilan o'quvchi allaqachon mavjud",
        error: 'Conflict',
      },
    },
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

   @UseGuards(JwtGuard, RolesGuard)
  @Post('add-to-group')
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "O'quvchini guruhga qo'shish",
    description: "Mavjud o'quvchini yangi guruhga qo'shish",
  })
  @ApiBody({ type: AddStudentToGroupDto })
  @ApiResponse({
    status: 201,
    description: "O'quvchi guruhga qo'shildi",
    schema: {
      example: {
        statusCode: 201,
        message: "O'quvchi guruhga muvaffaqiyatli qo'shildi",
        data: {
          id: 5,
          group: {
            id: 2,
            name: 'Matematika Advanced 2024',
          },
          student: {
            id: 1,
            fullName: 'Aliyev Alisher',
          },
          joinedAt: '2024-01-20',
          status: 'active',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quvchi yoki guruh topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "O'quvchi allaqachon guruhga qo'shilgan",
    schema: {
      example: {
        statusCode: 409,
        message: "O'quvchi allaqachon bu guruhga qo'shilgan",
        error: 'Conflict',
      },
    },
  })
  addToGroup(@Body() addToGroupDto: AddStudentToGroupDto) {
    return this.studentsService.addStudentToGroup(
      addToGroupDto.studentId,
      addToGroupDto.groupId,
    );
  }


  @UseGuards(JwtGuard, RolesGuard)
  @Get('learning-center/:learningCenterId')
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "O'quv markaziga tegishli o'quvchilarni olish",
    description:
      "Berilgan o'quv markazi ID si bo'yicha barcha o'quvchilarni qaytaradi",
  })
  @ApiResponse({
    status: 200,
    description: "O'quv markaziga tegishli o'quvchilar",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quv markaziga tegishli o'quvchilar muvaffaqiyatli topildi",
        data: [
          {
            id: 1,
            fullName: 'Aliyev Alisher',
            phone: '+998901234567',
            parentPhone: '+998901234568',
            birthDate: '2010-05-15',
            address: 'Toshkent, Chilonzor tumani',
            isActive: true,
            learningCenter: {
              id: 1,
              name: 'EduHub Learning Center',
            },
            groupStudents: [
              {
                id: 1,
                group: {
                  id: 1,
                  name: 'Ingliz tili Beginner 2024',
                },
                status: 'active',
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quvchilar topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quv markaziga tegishli o'quvchilar topilmadi",
        error: 'Not Found',
      },
    },
  })
  findLearningCenterStudents(
    @Param('learningCenterId') learningCenterId: string,
  ) {
    return this.studentsService.findLearningCenterStudents(+learningCenterId);
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "Barcha o'quvchilarni olish",
    description: "Tizimdagi barcha o'quvchilar ro'yxati (faqat adminlar uchun)",
  })
  @ApiResponse({
    status: 200,
    description: "Barcha o'quvchilar ro'yxati",
    schema: {
      example: {
        statusCode: 200,
        message: "Barcha o'quvchilar muvaffaqiyatli topildi",
        data: [
          {
            id: 1,
            fullName: 'Aliyev Alisher',
            phone: '+998901234567',
            parentPhone: '+998901234568',
            birthDate: '2010-05-15',
            isActive: true,
            learningCenter: {
              id: 1,
              name: 'EduHub Learning Center',
            },
            payments: [],
            attendances: [],
          },
        ],
      },
    },
  })
  findAll() {
    return this.studentsService.findAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Get(':id')
  @Roles(
    Role.LEARNING_CENTER,
    AdminRoles.ADMIN,
    AdminRoles.SUPERADMIN,
    Role.TEACHER,
  )
  @ApiOperation({
    summary: "O'quvchini ID bo'yicha olish",
    description: "Berilgan ID ga mos o'quvchi ma'lumotlari",
  })
  @ApiResponse({
    status: 200,
    description: "O'quvchi topildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quvchi muvaffaqiyatli topildi",
        data: {
          id: 1,
          fullName: 'Aliyev Alisher',
          phone: '+998901234567',
          parentPhone: '+998901234568',
          birthDate: '2010-05-15',
          address: 'Toshkent, Chilonzor tumani',
          isActive: true,
          learningCenter: {
            id: 1,
            name: 'EduHub Learning Center',
          },
          groupStudents: [
            {
              id: 1,
              group: {
                id: 1,
                name: 'Ingliz tili Beginner 2024',
                lessonTime: '15:00:00',
                lessonDays: 3,
              },
              joinedAt: '2024-01-15',
              status: 'active',
            },
          ],
          payments: [],
          attendances: [],
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quvchi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }


 
  @UseGuards(JwtGuard, RolesGuard)
  @Delete('remove-from-group')
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "O'quvchini guruhdan chiqarish",
    description: "O'quvchini guruhdan arxivlash (aktiv emas qilish)",
  })
  @ApiBody({ type: AddStudentToGroupDto })
  @ApiResponse({
    status: 200,
    description: "O'quvchi guruhdan chiqarildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quvchi guruhdan muvaffaqiyatli chiqarildi",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quvchi guruhga qo'shilmagan",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quvchi bu guruhga qo'shilmagan",
        error: 'Not Found',
      },
    },
  })
  removeFromGroup(@Body() removeFromGroupDto: AddStudentToGroupDto) {
    return this.studentsService.removeStudentFromGroup(
      removeFromGroupDto.studentId,
      removeFromGroupDto.groupId,
    );
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id')
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "O'quvchi ma'lumotlarini yangilash",
    description: "Berilgan ID ga mos o'quvchi ma'lumotlarini yangilash",
  })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: "O'quvchi yangilandi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quvchi muvaffaqiyatli yangilandi",
        data: {
          id: 1,
          fullName: 'Aliyev Alisher',
          phone: '+998901234567',
          parentPhone: '+998901234569',
          birthDate: '2010-05-15',
          address: 'Toshkent, Yunusobod tumani',
          isActive: true,
          updatedAt: '2024-01-20T15:45:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quvchi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Telefon raqami allaqachon mavjud',
    schema: {
      example: {
        statusCode: 409,
        message: "Bu telefon raqami bilan o'quvchi allaqachon mavjud",
        error: 'Conflict',
      },
    },
  })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @ApiOperation({
    summary: "O'quvchini o'chirish",
    description: "Berilgan ID ga mos o'quvchini tizimdan o'chirish",
  })
  @ApiResponse({
    status: 200,
    description: "O'quvchi o'chirildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quvchi muvaffaqiyatli o'chirildi",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "O'quvchi topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
