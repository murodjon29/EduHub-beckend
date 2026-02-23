import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Attendance } from '../../core/entities/attendance.entity';

@ApiTags('Attendances')
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Yangi davomat qo‘shish' })
  @ApiBody({
    type: CreateAttendanceDto,
    examples: {
      example1: {
        summary: 'Oddiy create',
        value: {
          groupId: 1,
          studentId: 5,
          teacherId: 2,
          date: '2026-02-23',
          status: 'PRESENT',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Davomat muvaffaqiyatli yaratildi',
    schema: {
      example: {
        id: 10,
        date: '2026-02-23',
        status: 'PRESENT',
        group: {
          id: 1,
          name: 'Frontend N12',
        },
        student: {
          id: 5,
          fullName: 'Ali Valiyev',
        },
        teacher: {
          id: 2,
          fullName: 'John Doe',
        },
        createdAt: '2026-02-23T08:00:00.000Z',
        updatedAt: '2026-02-23T08:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Duplicate yoki noto‘g‘ri request',
    schema: {
      example: {
        statusCode: 400,
        message:
          'Bu student uchun shu sanada davomat allaqachon mavjud',
        error: 'Bad Request',
      },
    },
  })
  create(@Body() dto: CreateAttendanceDto): Promise<Attendance> {
    return this.attendanceService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Barcha davomalarni olish' })
  @ApiResponse({
    status: 200,
    description: 'Davomatlar ro‘yxati',
  })
  findAll(): Promise<Attendance[]> {
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bitta davomatni olish' })
  @ApiResponse({
    status: 200,
    description: 'Topilgan davomat',
  })
  @ApiResponse({
    status: 404,
    description: 'Topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Attendance topilmadi',
        error: 'Not Found',
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Davomatni o‘chirish' })
  @ApiResponse({
    status: 200,
    description: 'O‘chirildi',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}