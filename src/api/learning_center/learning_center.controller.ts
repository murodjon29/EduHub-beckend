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
  ApiQuery,
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

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get('/:id/lessons')
  @ApiOperation({ summary: 'Learning center bo‘yicha barcha darslarni olish' })
  @ApiParam({
    name: 'id',
    example: 1,
    description: 'Learning center ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Lessons list',
  })
  async findLessonsByLearningCenter(@Param('id') id: number) {
    return this.learningCenterService.findLessonsByLearningCenter(id);
  }

  // learning_center.controller.ts ga qo'shish

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get(':learningCenterId/calendar')
  @ApiOperation({
    summary: "O'quv markazi kalendar ma'lumotlari",
  })
  @ApiParam({
    name: 'learningCenterId',
    example: 1,
  })
  @ApiQuery({
    name: 'year',
    example: 2026,
    description: 'Yil',
  })
  @ApiQuery({
    name: 'month',
    example: 3,
    description: 'Oy (1-12)',
  })
  @ApiResponse({
    status: 200,
    description: "Kalendar ma'lumotlari muvaffaqiyatli olindi",
    schema: {
      example: {
        statusCode: 200,
        message: "Kalendar ma'lumotlari muvaffaqiyatli olindi",
        data: {
          '2026-03-02': {
            date: '2026-03-02',
            lessons: [
              {
                id: 1,
                name: 'Mathematics V01',
                time: '09:00 – 12:00',
                groupName: 'Group A',
              },
            ],
            payments: [],
            birthdays: [
              {
                id: 12,
                fullName: 'Kamola Yusupova',
                phone: '+998901234567',
                birthDate: '2000-03-02',
              },
            ],
          },
        },
      },
    },
  })
  async getCalendarData(
    @Param('learningCenterId', ParseIntPipe) learningCenterId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ) {
    return this.learningCenterService.getCalendarData(
      learningCenterId,
      year,
      month,
    );
  }

  // =================================
  // GET STUDENTS BY LEARNING CENTER
  // =================================

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get(':learningCenterId/students')
  @ApiOperation({
    summary: "O'quv markaziga tegishli o'quvchilarni olish",
  })
  @ApiParam({
    name: 'learningCenterId',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "O'quvchilar muvaffaqiyatli topildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'quvchilar muvaffaqiyatli topildi",
        data: [],
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

  // =================================
  // GET TEACHERS BY LEARNING CENTER
  // =================================

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get(':learningCenterId/teachers')
  @ApiOperation({
    summary: "O'quv markaziga tegishli o'qituvchilarni olish",
  })
  @ApiParam({
    name: 'learningCenterId',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "O'qituvchilar topildi",
    schema: {
      example: {
        statusCode: 200,
        message: "O'qituvchilar topildi",
        data: [],
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

  // =================================
  // GET LEARNING CENTER STATISTICS
  // =================================

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get(':learningCenterId/statistics')
  @ApiOperation({
    summary: "O'quv markazi statistikasi",
  })
  @ApiParam({
    name: 'learningCenterId',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Statistika muvaffaqiyatli olindi',
    schema: {
      example: {
        statusCode: 200,
        message: 'Statistika muvaffaqiyatli olindi',
        data: {
          studentCount: 120,
          teacherCount: 10,
          totalPayments: 35000000,
        },
      },
    },
  })
  async statistics(
    @Param('learningCenterId', ParseIntPipe)
    learningCenterId: number,
  ) {
    return this.learningCenterService.statistics(learningCenterId);
  }

  // =================================
  // DELETE PROFILE IMAGE
  // =================================

  @UseGuards(JwtGuard, SelfGuard)
  @Delete(':id/profile-image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Learning center profil rasmini o‘chirish',
  })
  @ApiParam({
    name: 'id',
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Profil rasmi o‘chirildi',
    schema: {
      example: {
        success: true,
        message: 'Profile image deleted successfully',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Learning center topilmadi',
  })
  async deleteProfileImage(@Param('id', ParseIntPipe) id: number) {
    return this.learningCenterService.deleteProfileImage(id);
  }
}
