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
  Req,
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
} from '@nestjs/swagger';

import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';

import { AdminRoles, Role } from '../../common/enum';

@ApiTags('groups')
@ApiBearerAuth()
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  // CREATE GROUP
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Yangi guruh yaratish' })
  @ApiBody({
    type: CreateGroupDto,
    examples: {
      ielts: {
        summary: 'IELTS guruhi',
        value: {
          name: 'IELTS 7.0',
          startDate: '2024-01-10',
          endDate: '2024-06-10',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          maxStudents: 15,
          room: '201',
          description: 'IELTS tayyorgarlik guruhi',
          teacher_id: 1,
          learning_center_id: 1,
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Guruh yaratildi',
    schema: {
      example: {
        statusCode: 201,
        message: 'Group created successfully',
        data: {
          id: 1,
          name: 'IELTS 7.0',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          currentStudents: 0,
          teacher: {
            id: 1,
            firstName: 'Ali',
            lastName: 'Karimov',
          },
          learningCenter: {
            id: 1,
            name: 'Najot Talim',
          },
        },
      },
    },
  })
  async create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupService.create(createGroupDto);
  }

  // GET ALL GROUPS
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get()
  @ApiOperation({ summary: 'Barcha guruhlar' })
  @ApiOkResponse({
    description: 'Guruhlar ro‘yxati',
    schema: {
      example: {
        statusCode: 200,
        message: 'Groups fetched successfully',
        data: [
          {
            id: 1,
            name: 'IELTS 7.0',
            lessonDays: 3,
            lessonTime: '15:00',
            monthlyPrice: 500000,
            currentStudents: 10,
          },
          {
            id: 2,
            name: 'Matematika 11-sinf',
            lessonDays: 2,
            lessonTime: '17:00',
            monthlyPrice: 300000,
            currentStudents: 8,
          },
        ],
      },
    },
  })
  async findAll() {
    return this.groupService.findAll();
  }

  // TEACHER GROUPS
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get('teacher/my-groups')
  @ApiOperation({ summary: "Teacher o'z guruhlarini oladi" })
  @ApiOkResponse({
    description: 'Teacher guruhlari',
    schema: {
      example: {
        statusCode: 200,
        message: 'Teacher groups fetched',
        data: [
          {
            id: 1,
            name: 'IELTS 7.0',
            lessonDays: 3,
            lessonTime: '15:00',
            currentStudents: 8,
          },
        ],
      },
    },
  })
  async findMyGroups(@Req() req) {
    return this.groupService.findByTeacher(req.user.id);
  }

  // GET ONE GROUP
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN)
  @Get(':id')
  @ApiParam({
    name: 'id',
    example: 1,
  })
  @ApiOperation({ summary: 'Bitta guruhni olish' })
  @ApiOkResponse({
    description: 'Group found',
    schema: {
      example: {
        statusCode: 200,
        message: 'Group fetched successfully',
        data: {
          id: 1,
          name: 'IELTS 7.0',
          lessonDays: 3,
          lessonTime: '15:00',
          monthlyPrice: 500000,
          teacher: {
            id: 1,
            firstName: 'Ali',
            lastName: 'Karimov',
          },
          learningCenter: {
            id: 1,
            name: 'Najot Talim',
          },
        },
      },
    },
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  // LEARNING CENTER O'Z GURUHINI OLADI
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Get('learning-center/:learningCenterId')
  @ApiParam({
    name: 'learningCenterId',
    example: 1,
  })
  @ApiOperation({ summary: "O'quv markazi o'z guruhlarini oladi" })
  @ApiOkResponse({
    description: 'Learning center groups',
    schema: {
      example: {
        statusCode: 200,
        message: 'Groups fetched successfully',
        data: [
          {
            id: 1,
            name: 'IELTS 7.0',
            lessonDays: 3,
            lessonTime: '15:00',
            monthlyPrice: 500000,
            currentStudents: 10,
            teacher: {
              id: 1,
              firstName: 'Ali',
              lastName: 'Karimov',
            },
            learningCenter: {
              id: 1,
              name: 'Najot Talim',
            },
          },
        ],
      },
    },
  })
  async findByLearningCenter( @Param('learningCenterId', ParseIntPipe) learningCenterId: number) {
    return this.groupService.findByLearningCenter(learningCenterId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get('teacher/:groupId')
  @ApiOperation({ summary: 'Teacher o‘z guruhini olish' })
  @ApiParam({
    name: 'groupId',
    example: 1,
  })
  @ApiOkResponse({ 
    description: 'Guruh muvaffaqiyatli olingan',
    schema: {
      example: {
        statusCode: 200,
        message: 'Guruh muvaffaqiyatli olingan',
        data: {
          id: 1,
          name: 'IELTS 7.0',
          lessonDays: 3,
          lessonTime: '15:00',
          teacher: {
            id: 1,
            firstName: 'Ali',
            lastName: 'Karimov',
          },
          learningCenter: {
            id: 1,
            name: 'Najot Talim',
          },
        },
      },
    },
  })
  async findTeacherGroup(
    @Req() req,
    @Param('groupId', ParseIntPipe) groupId: number,
  ) {
    return this.groupService.findOneByTeacher(req.user.id, groupId);
  }

  // UPDATE
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER, AdminRoles.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Guruhni yangilash' })
  @ApiBody({
    type: UpdateGroupDto,
    examples: {
      update: {
        value: {
          name: 'IELTS 8.0',
          monthlyPrice: 600000,
          room: '301',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Group updated',
    schema: {
      example: {
        statusCode: 200,
        message: 'Group updated successfully',
      },
    },
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupService.update(id, updateGroupDto);
  }

  // DELETE
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(AdminRoles.ADMIN, AdminRoles.SUPERADMIN)
  @Delete(':id')
  @ApiOperation({ summary: "Guruhni o'chirish" })
  @ApiOkResponse({
    description: 'Group deleted',
    schema: {
      example: {
        statusCode: 200,
        message: 'Group deleted successfully',
      },
    },
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.remove(id);
  }
}
