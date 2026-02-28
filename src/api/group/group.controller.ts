import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { SelfGuard } from '../../common/guard/self.guard';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { AdminRoles, Role } from '../../common/enum';

// Response DTO'lar
class GroupResponseDto {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  lessonDays: number;
  lessonTime: string;
  monthlyPrice: number;
  isActive: boolean;
  maxStudents?: number;
  room?: string;
  description?: string;
  currentStudents: number;
  createdAt: Date;
  updatedAt: Date;
  teacher?: {
    id: number;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  learningCenter: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
  };
  groupStudents?: any[];
}

class ApiResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
}

@ApiTags('groups')
@ApiBearerAuth('Authorization')
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Yangi guruh yaratish',
    description: "O'quv markazida yangi guruh yaratish",
  })
  @ApiBody({
    type: CreateGroupDto,
    description: "Guruh yaratish uchun ma'lumotlar",
    examples: {
      'IELTS guruhi': {
        value: {
          name: 'IELTS 7.0',
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          isActive: true,
          maxStudents: 15,
          room: '201-xona',
          description: 'IELTS tayyorgarlik guruhi',
          teacher_id: 1,
          learning_center_id: 1,
        },
      },
      'Matematika guruhi': {
        value: {
          name: 'Matematika 11-sinf',
          startDate: '2024-02-01',
          endDate: '2024-05-30',
          lessonDays: 2,
          lessonTime: '16:30',
          monthlyPrice: 350000,
          isActive: true,
          maxStudents: 12,
          room: '105-xona',
          teacher_id: 2,
          learning_center_id: 1,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Guruh muvaffaqiyatli yaratildi',
    schema: {
      example: {
        statusCode: 201,
        message: 'Guruh muvaffaqiyatli yaratildi',
        data: {
          id: 1,
          name: 'IELTS 7.0',
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          isActive: true,
          maxStudents: 15,
          room: '201-xona',
          description: 'IELTS tayyorgarlik guruhi',
          currentStudents: 0,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-01T10:00:00.000Z',
          teacher: {
            id: 1,
            firstName: 'Ali',
            lastName: 'Karimov',
            phone: '+998901234567',
          },
          learningCenter: {
            id: 1,
            name: 'ABC Learning Center',
            address: 'Toshkent sh., Chilonzor tumani',
            phone: '+998901234567',
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: "Noto'g'ri ma'lumotlar kiritilganda",
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name must be a string',
          'monthlyPrice must be a positive number',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: "O'qituvchi yoki o'quv markazi topilmaganda",
    schema: {
      examples: {
        teacherNotFound: {
          value: {
            statusCode: 404,
            message: "O'qituvchi topilmadi",
            error: 'Not Found',
          },
        },
        centerNotFound: {
          value: {
            statusCode: 404,
            message: "O'quv markazi topilmadi",
            error: 'Not Found',
          },
        },
      },
    },
  })
  async create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get()
  @ApiOperation({
    summary: 'Barcha guruhlarni olish',
    description: "Tizimdagi barcha guruhlar ro'yxatini olish",
  })
  @ApiOkResponse({
    description: "Guruhlar ro'yxati",
    schema: {
      example: {
        statusCode: 200,
        message: 'Guruhlar muvaffaqiyatli olingan',
        data: [
          {
            id: 1,
            name: 'IELTS 7.0',
            startDate: '2024-01-15',
            endDate: '2024-06-15',
            lessonDays: 3,
            lessonTime: '15:00',
            monthlyPrice: 500000,
            isActive: true,
            maxStudents: 15,
            room: '201-xona',
            description: 'IELTS tayyorgarlik guruhi',
            currentStudents: 8,
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
            teacher: {
              id: 1,
              firstName: 'Ali',
              lastName: 'Karimov',
              phone: '+998901234567',
            },
            learningCenter: {
              id: 1,
              name: 'ABC Learning Center',
              address: 'Toshkent sh., Chilonzor tumani',
              phone: '+998901234567',
            },
            groupStudents: [
              {
                id: 1,
                student: {
                  id: 1,
                  firstName: 'Vali',
                  lastName: 'Aliyev',
                },
              },
            ],
          },
          {
            id: 2,
            name: 'Matematika 11-sinf',
            startDate: '2024-02-01',
            endDate: '2024-05-30',
            lessonDays: 2,
            lessonTime: '16:30',
            monthlyPrice: 350000,
            isActive: true,
            maxStudents: 12,
            room: '105-xona',
            description: 'Matematika fanidan tayyorgarlik',
            currentStudents: 5,
            createdAt: '2024-01-05T09:30:00.000Z',
            updatedAt: '2024-01-05T09:30:00.000Z',
            teacher: {
              id: 2,
              firstName: 'Dilnoza',
              lastName: 'Rustamova',
              phone: '+998901234568',
            },
            learningCenter: {
              id: 1,
              name: 'ABC Learning Center',
              address: 'Toshkent sh., Chilonzor tumani',
              phone: '+998901234567',
            },
            groupStudents: [],
          },
        ],
      },
    },
  })
  async findAll() {
    return this.groupService.findAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN, Role.LEARNING_CENTER)
  @Get('teacher/:teacherId')
  @ApiOperation({
    summary: "O'qituvchi bo'yicha guruhlarni olish",
    description: "Muayyan o'qituvchiga tegishli guruhlar ro'yxatini olish",
  })
  @ApiParam({
    name: 'teacherId',
    type: Number,
    description: "O'qituvchi ID si",
    example: 1,
  })
  @ApiOkResponse({
    description: "O'qituvchi guruhlari",
    schema: {
      example: {
        statusCode: 200,
        message: 'Guruhlar muvaffaqiyatli olingan',
        data: [
          {
            id: 1,
            name: 'IELTS 7.0',
            lessonDays: 3,
            lessonTime: '15:00',
            currentStudents: 8,
            teacher: {
              id: 1,
              firstName: 'Ali',
              lastName: 'Karimov',
            },
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: "O'qituvchi topilmaganda",
    schema: {
      example: {
        statusCode: 404,
        message: "O'qituvchi topilmadi",
        error: 'Not Found',
      },
    },
  })
  async findByTeacher(@Param('teacherId', ParseIntPipe) teacherId: number) {
    return this.groupService.findByTeacher(teacherId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN, Role.LEARNING_CENTER)
  @Get('learning-center/:centerId')
  @ApiOperation({
    summary: "O'quv markazi bo'yicha guruhlarni olish",
    description: "Muayyan o'quv markaziga tegishli guruhlar ro'yxatini olish",
  })
  @ApiParam({
    name: 'centerId',
    type: Number,
    description: "O'quv markazi ID si",
    example: 1,
  })
  @ApiOkResponse({
    description: "O'quv markazi guruhlari",
    schema: {
      example: {
        statusCode: 200,
        message: 'Guruhlar muvaffaqiyatli olingan',
        data: [
          {
            id: 1,
            name: 'IELTS 7.0',
            lessonDays: 3,
            lessonTime: '15:00',
            currentStudents: 8,
            learningCenter: {
              id: 1,
              name: 'ABC Learning Center',
            },
          },
          {
            id: 2,
            name: 'Matematika 11-sinf',
            lessonDays: 2,
            lessonTime: '16:30',
            currentStudents: 5,
            learningCenter: {
              id: 1,
              name: 'ABC Learning Center',
            },
          },
        ],
      },
    },
  })
  async findByLearningCenter(
    @Param('centerId', ParseIntPipe) centerId: number,
  ) {
    return this.groupService.findByLearningCenter(centerId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN, Role.LEARNING_CENTER)
  @Get(':id')
  @ApiOperation({
    summary: 'Bitta guruhni olish',
    description: "ID bo'yicha bitta guruh ma'lumotlarini olish",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Guruh ID si',
    examples: {
      validId: {
        value: 1,
        description: 'Mavjud guruh ID si',
      },
    },
  })
  @ApiOkResponse({
    description: "Guruh ma'lumotlari",
    schema: {
      example: {
        statusCode: 200,
        message: 'Guruh muvaffaqiyatli olingan',
        data: {
          id: 1,
          name: 'IELTS 7.0',
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          isActive: true,
          maxStudents: 15,
          room: '201-xona',
          description: 'IELTS tayyorgarlik guruhi',
          currentStudents: 8,
          createdAt: '2024-01-01T10:00:00.000Z',
          updatedAt: '2024-01-15T15:00:00.000Z',
          teacher: {
            id: 1,
            firstName: 'Ali',
            lastName: 'Karimov',
            phone: '+998901234567',
            email: 'ali.karimov@example.com',
          },
          learningCenter: {
            id: 1,
            name: 'ABC Learning Center',
            address: 'Toshkent sh., Chilonzor tumani',
            phone: '+998901234567',
          },
          groupStudents: [
            {
              id: 1,
              student: {
                id: 1,
                firstName: 'Vali',
                lastName: 'Aliyev',
                phone: '+998901234569',
              },
              joinedAt: '2024-01-10T09:00:00.000Z',
            },
            {
              id: 2,
              student: {
                id: 2,
                firstName: 'Sobir',
                lastName: 'Karimov',
                phone: '+998901234570',
              },
              joinedAt: '2024-01-12T10:30:00.000Z',
            },
          ],
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Guruh topilmaganda',
    schema: {
      example: {
        statusCode: 404,
        message: 'Guruh topilmadi',
        error: 'Not Found',
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN, Role.LEARNING_CENTER)
  @Patch(':id')
  @ApiOperation({
    summary: 'Guruhni yangilash',
    description: "Guruh ma'lumotlarini yangilash",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Yangilanadigan guruh ID si',
    example: 1,
  })
  @ApiBody({
    type: UpdateGroupDto,
    description: "Yangilash uchun ma'lumotlar",
    examples: {
      'Qisman yangilash': {
        value: {
          name: 'IELTS 7.0 (Intensive)',
          maxStudents: 12,
          room: '202-xona',
        },
      },
      "To'liq yangilash": {
        value: {
          name: 'IELTS 8.0',
          startDate: '2024-02-01',
          endDate: '2024-07-01',
          lessonDays: 4,
          lessonTime: '17:00',
          monthlyPrice: 600000,
          maxStudents: 10,
          room: '301-xona',
          description: 'Intensive IELTS preparation',
          teacher_id: 2,
          learning_center_id: 1,
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Guruh yangilandi',
    schema: {
      example: {
        statusCode: 200,
        message: 'Guruh muvaffaqiyatli yangilandi',
        data: {
          id: 1,
          name: 'IELTS 7.0 (Intensive)',
          startDate: '2024-01-15',
          endDate: '2024-06-15',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          isActive: true,
          maxStudents: 12,
          room: '202-xona',
          description: 'IELTS tayyorgarlik guruhi',
          currentStudents: 8,
          updatedAt: '2024-01-20T11:30:00.000Z',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Guruh, o'qituvchi yoki o'quv markazi topilmaganda",
    schema: {
      examples: {
        groupNotFound: {
          value: {
            statusCode: 404,
            message: 'Guruh topilmadi',
            error: 'Not Found',
          },
        },
        teacherNotFound: {
          value: {
            statusCode: 404,
            message: "O'qituvchi topilmadi",
            error: 'Not Found',
          },
        },
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(id, updateGroupDto);
  }
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN, Role.LEARNING_CENTER)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Guruhni o'chirish",
    description: "Guruhni tizimdan o'chirish",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "O'chiriladigan guruh ID si",
    example: 1,
  })
  @ApiOkResponse({
    description: "Guruh o'chirildi",
    schema: {
      example: {
        statusCode: 200,
        message: "Guruh muvaffaqiyatli o'chirildi",
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Guruh topilmaganda',
    schema: {
      example: {
        statusCode: 404,
        message: 'Guruh topilmadi',
        error: 'Not Found',
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.remove(id);
  }
}
