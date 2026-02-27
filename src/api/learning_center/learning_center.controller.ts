import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { SelfGuard } from '../../common/guard/self.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { AdminRoles, Role } from '../../common/enum';
import { Roles } from '../../common/decorator/roles.decorator';

@ApiTags('Learning Center')
@Controller('learning-centers')
export class LearningCenterController {
  constructor(
    private readonly learningCenterService: LearningCenterService,
  ) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Get(':learningCenterId/students')
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
    return this.learningCenterService.findLearningCenterStudents(+learningCenterId);
  }

  @ApiParam({
      name: 'learningCenterId',
      description: "O'quv markazi ID si",
      required: true,
      example: 1,
    })
    @ApiBody({
      description: "O'quv markazi ID si",
      type: Number,
    })
    @ApiResponse({
      status: 200,
      description: "O'quv markaziga tegishli o'qituvchilar ro'yxati",
      schema: {
        example: {
          statusCode: 200,
          message:
            "O'quv markaziga tegishli o'qituvchilar muvaffaqiyatli topildi",
          data: [
            {
              id: 1,
              login: 'teacher_john',
              name: 'John',
              lastName: 'Doe',
              email: '  john.doe@example.com',
              phone: '+998901234567',
              subject: 'Matematika',
              salary: 5000000,
              role: 'teacher',
              learningCenterId: 1,
              created_at: '2024-01-15T10:30:00.000Z',
              updated_at: '2024-01-15T10:30:00.000Z',
            },
            {
              id: 2,
              login: 'teacher_jane',
              name: 'Jane',
              lastName: 'Smith',
              email: '  jane.smith@example.com',
              phone: '+998901234568',
              subject: 'Fizika',
              salary: 5500000,
              role: 'teacher',
              learningCenterId: 1,
              created_at: '2024-01-16T09:20:00.000Z',
              updated_at: '2024-01-16T09:20:00.000Z',
            },
          ],
        },
      },
    })
    @ApiResponse({
      status: 404,
      description: "O'quv markazi topilmadi",
      schema: {
        example: {
          statusCode: 404,
          message: "O'quv markazi topilmadi",
          error: 'Not Found',
        },
      },
    })
    @UseGuards(JwtGuard, RolesGuard)
    @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
    @ApiBearerAuth("Authorization")
    @Get(':learningCenterId/teachers')
    async findLearningCenterTeachers(
      @Param('learningCenterId') learningCenterId: string,
    ) {
      return this.learningCenterService.getTeachersByLearningCenter(+learningCenterId);
    }

  @UseGuards(JwtGuard, SelfGuard)
  @ApiBearerAuth("Authorization")
  @Delete(':id/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete learning center profile image',
    description:
      'Deletes profile image of the specified learning center and removes file from storage.',
  })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'Learning center ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile image successfully deleted',
    schema: {
      example: {
        message: 'Profile image deleted successfully',
        success: true,
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Learning center not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async deleteProfileImage(
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.learningCenterService.deleteProfileImage(id);

    return {
      success: true,
      message: 'Profile image deleted successfully',
    };
  }
}