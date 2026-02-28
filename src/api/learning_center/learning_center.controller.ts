import {
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { LearningCenterService } from './learning_center.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { SelfGuard } from '../../common/guard/self.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { AdminRoles, Role } from '../../common/enum';
import { Roles } from '../../common/decorator/roles.decorator';

@ApiTags('Learning Center')
@ApiBearerAuth('Authorization')
@Controller('learning-centers')
export class LearningCenterController {
  constructor(private readonly learningCenterService: LearningCenterService) {}

  // ============================
  // GET STUDENTS BY CENTER
  // ============================

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get(':learningCenterId/students')
  @ApiOperation({
    summary: "O'quv markaziga tegishli o'quvchilarni olish",
  })
  @ApiParam({
    name: 'learningCenterId',
    required: true,
    example: 1,
    description: "O'quv markazi ID",
  })
  @ApiResponse({
    status: 200,
    description: "O'quvchilar ro'yxati",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quvchilar muvaffaqiyatli topildi",
        data: [
          {
            id: 1,
            fullName: 'Aliyev Alisher',
            phone: '+998901234567',
            parentPhone: '+998901234568',
            birthDate: '2010-05-15',
            isActive: true,
            address: 'Toshkent',
            learningCenterId: 1,
            groupStudents: [
              {
                id: 1,
                status: 'ACTIVE',
                group: {
                  id: 3,
                  name: 'Frontend Bootcamp',
                },
              },
            ],
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: "O'quvchilar topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'quvchilar topilmadi",
        error: 'Not Found',
      },
    },
  })
  async findLearningCenterStudents(
    @Param('learningCenterId', ParseIntPipe)
    learningCenterId: number,
  ) {
    return this.learningCenterService.findLearningCenterStudents(
      learningCenterId,
    );
  }

  // ============================
  // GET TEACHERS BY CENTER
  // ============================

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get(':learningCenterId/teachers')
  @ApiOperation({
    summary: "O'quv markaziga tegishli o'qituvchilarni olish",
  })
  @ApiParam({
    name: 'learningCenterId',
    required: true,
    example: 1,
    description: "O'quv markazi ID",
  })
  @ApiResponse({
    status: 200,
    description: "O'qituvchilar ro'yxati",
    schema: {
      example: {
        statusCode: 200,
        message: "O'qituvchilar muvaffaqiyatli topildi",
        data: [
          {
            id: 1,
            name: 'John',
            lastName: 'Doe',
            phone: '+998901234567',
            subject: 'Matematika',
            salary: 5000000,
            role: 'TEACHER',
            learningCenterId: 1,
            isActive: true,
            createdAt: '2024-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiNotFoundResponse({
    description: "O'qituvchilar topilmadi",
    schema: {
      example: {
        statusCode: 404,
        message: "O'qituvchilar topilmadi",
        error: 'Not Found',
      },
    },
  })
  async findLearningCenterTeachers(
    @Param('learningCenterId', ParseIntPipe)
    learningCenterId: number,
  ) {
    return this.learningCenterService.getTeachersByLearningCenter(
      learningCenterId,
    );
  }

  // ============================
  // DELETE PROFILE IMAGE
  // ============================

  @UseGuards(JwtGuard, SelfGuard)
  @Delete(':id/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Learning center profil rasmini o‘chirish',
  })
  @ApiParam({
    name: 'id',
    example: 5,
    description: 'Learning center ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil rasmi muvaffaqiyatli o‘chirildi',
    schema: {
      example: {
        success: true,
        message: 'Profile image deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Learning center topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'User not found',
        error: 'Not Found',
      },
    },
  })
  async deleteProfileImage(@Param('id', ParseIntPipe) id: number) {
    return this.learningCenterService.deleteProfileImage(id);
  }
}
