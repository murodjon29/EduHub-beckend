import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from '../../core/entities/attendance.entity';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../../common/enum';

// ─── Shared Swagger Examples ───────────────────────────────────────────────

const ATTENDANCE_EXAMPLE = {
  id: 10,
  date: '2026-02-23',
  status: 'PRESENT',
  group: { id: 1, name: 'Frontend N12' },
  student: { id: 5, fullName: 'Ali Valiyev' },
  teacher: { id: 2, fullName: 'John Doe' },
  createdAt: '2026-02-23T08:00:00.000Z',
  updatedAt: '2026-02-23T08:00:00.000Z',
};

const ATTENDANCE_LIST_EXAMPLE = [
  ATTENDANCE_EXAMPLE,
  {
    id: 11,
    date: '2026-02-23',
    status: 'ABSENT',
    group: { id: 1, name: 'Frontend N12' },
    student: { id: 6, fullName: 'Vali Karimov' },
    teacher: { id: 2, fullName: 'John Doe' },
    createdAt: '2026-02-23T08:00:00.000Z',
    updatedAt: '2026-02-23T08:00:00.000Z',
  },
];

const NOT_FOUND_EXAMPLE = {
  statusCode: 404,
  message: 'Attendance topilmadi',
  error: 'Not Found',
};

const DUPLICATE_EXAMPLE = {
  statusCode: 400,
  message: 'Bu student uchun shu sanada davomat allaqachon mavjud',
  error: 'Bad Request',
};

const UPDATE_SUCCESS_EXAMPLE = {
  statusCode: 200,
  message: 'Attendance updated successfully',
  data: ATTENDANCE_EXAMPLE,
};

const DELETE_SUCCESS_EXAMPLE = {
  statusCode: 200,
  message: 'Attendance muvaffaqiyatli ochirildi',
};

const CREATE_BODY_EXAMPLES = {
  present: {
    summary: 'Student kelgan holat',
    value: {
      groupId: 1,
      studentId: 5,
      teacherId: 2,
      date: '2026-02-23',
      status: 'PRESENT',
    },
  },
  absent: {
    summary: 'Student kelmagan holat',
    value: {
      groupId: 1,
      studentId: 6,
      teacherId: 2,
      date: '2026-02-23',
      status: 'ABSENT',
    },
  },
  withoutTeacher: {
    summary: "Teacher ko'rsatilmagan holat",
    value: {
      groupId: 1,
      studentId: 7,
      date: '2026-02-23',
      status: 'PRESENT',
    },
  },
  withoutDate: {
    summary: "Date ko'rsatilmasa bugungi sana olinadi",
    value: {
      groupId: 1,
      studentId: 8,
      teacherId: 2,
      status: 'PRESENT',
    },
  },
};

const UPDATE_BODY_EXAMPLES = {
  updateStatus: {
    summary: "Faqat statusni o'zgartirish",
    value: { status: 'ABSENT' },
  },
  updateDate: {
    summary: "Faqat sanani o'zgartirish",
    value: { date: '2026-03-01' },
  },
  updateAll: {
    summary: 'Barcha maydonlarni yangilash',
    value: {
      groupId: 2,
      studentId: 5,
      teacherId: 3,
      date: '2026-03-01',
      status: 'PRESENT',
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────

@ApiBearerAuth()
@ApiTags('Attendances')
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // ═══════════════════════════════════════════
  // TEACHER ENDPOINTS
  // ═══════════════════════════════════════════

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Post()
  @ApiOperation({
    summary: "Yangi davomat qo'shish",
    description:
      "Teacher o'z guruhi uchun yangi davomat yozuvi yaratadi. Bir student uchun bir kunda faqat bitta davomat bo'lishi mumkin.",
  })
  @ApiBody({
    type: CreateAttendanceDto,
    examples: CREATE_BODY_EXAMPLES,
  })
  @ApiResponse({
    status: 201,
    description: 'Davomat muvaffaqiyatli yaratildi',
    schema: { example: ATTENDANCE_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description:
      'Duplicate davomat — shu sanada ushbu student uchun davomat allaqachon mavjud',
    schema: { example: DUPLICATE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Group, Student yoki Teacher topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Group topilmadi',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get()
  @ApiOperation({
    summary: 'Barcha davomatlarni olish',
    description:
      "Tizimda mavjud barcha davomatlarni sana bo'yicha kamayish tartibida qaytaradi.",
  })
  @ApiResponse({
    status: 200,
    description: "Davomatlar ro'yxati muvaffaqiyatli qaytarildi",
    schema: { example: ATTENDANCE_LIST_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  findAll(): Promise<Attendance[]> {
    return this.attendanceService.findAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get(':id')
  @ApiOperation({
    summary: "Bitta davomatni ID bo'yicha olish",
    description:
      "Berilgan ID bo'yicha bitta davomat yozuvini group, student va teacher ma'lumotlari bilan qaytaradi.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Davomat ID raqami',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Davomat muvaffaqiyatli topildi',
    schema: { example: ATTENDANCE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat topilmadi',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Patch(':id')
  @ApiOperation({
    summary: 'Davomatni yangilash',
    description:
      "Mavjud davomat yozuvini qisman yoki to'liq yangilaydi. Faqat o'zgartirmoqchi bo'lgan maydonlarni yuboring.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "Yangilanishi kerak bo'lgan davomat ID raqami",
    example: 10,
  })
  @ApiBody({
    type: UpdateAttendanceDto,
    examples: UPDATE_BODY_EXAMPLES,
  })
  @ApiResponse({
    status: 200,
    description: 'Davomat muvaffaqiyatli yangilandi',
    schema: { example: UPDATE_SUCCESS_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: "Yangilangan ma'lumotlar boshqa davomatga conflict qilmoqda",
    schema: { example: DUPLICATE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat topilmadi',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(updateDto, id);
  }

  // ═══════════════════════════════════════════
  // LEARNING CENTER ENDPOINTS
  // ═══════════════════════════════════════════

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER)
  @Post('learning-center/create')
  @ApiOperation({
    summary: "Learning Center — Yangi davomat qo'shish",
    description:
      "Learning Center o'z markaziga tegishli guruh uchun yangi davomat yaratadi.",
  })
  @ApiBody({
    type: CreateAttendanceDto,
    examples: CREATE_BODY_EXAMPLES,
  })
  @ApiResponse({
    status: 201,
    description: 'Davomat muvaffaqiyatli yaratildi',
    schema: { example: ATTENDANCE_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description:
      'Duplicate davomat — shu sanada ushbu student uchun davomat allaqachon mavjud',
    schema: { example: DUPLICATE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Group, Student yoki Teacher topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Student topilmadi',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  learningCenterCreate(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER)
  @Get('learning-center/findAll')
  @ApiOperation({
    summary: "Learning Center — O'z markazining barcha davomatlarini olish",
    description:
      "JWT token orqali learningCenterId aniqlanadi va faqat o'sha markazga tegishli davomatlar qaytariladi.",
  })
  @ApiResponse({
    status: 200,
    description: "Davomatlar ro'yxati muvaffaqiyatli qaytarildi",
    schema: { example: ATTENDANCE_LIST_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  learningCenterFindAll(@Request() req): Promise<Attendance[]> {
    const learningCenterId: number = req.user.learningCenterId;
    return this.attendanceService.learningCenterFindAll(learningCenterId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER)
  @Get('learning-center/:id')
  @ApiOperation({
    summary: "Learning Center — Bitta davomatni ID bo'yicha olish",
    description:
      "Faqat o'z markaziga tegishli davomatni ko'rish mumkin. Boshqa markazning davomati so'ralsa 404 qaytariladi.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Davomat ID raqami',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Davomat muvaffaqiyatli topildi',
    schema: { example: ATTENDANCE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat topilmadi yoki bu markazga tegishli emas',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  learningCenterFindOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<Attendance> {
    const learningCenterId: number = req.user.learningCenterId;
    return this.attendanceService.learningCenterFindOne(id, learningCenterId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER)
  @Patch('learning-center/:id')
  @ApiOperation({
    summary: 'Learning Center — Davomatni yangilash',
    description:
      "O'z markaziga tegishli davomatni qisman yoki to'liq yangilaydi.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "Yangilanishi kerak bo'lgan davomat ID raqami",
    example: 10,
  })
  @ApiBody({
    type: UpdateAttendanceDto,
    examples: UPDATE_BODY_EXAMPLES,
  })
  @ApiResponse({
    status: 200,
    description: 'Davomat muvaffaqiyatli yangilandi',
    schema: { example: UPDATE_SUCCESS_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: "Yangilangan ma'lumotlar boshqa davomatga conflict qilmoqda",
    schema: { example: DUPLICATE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat topilmadi',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  learningCenterUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(updateDto, id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.LEARNING_CENTER)
  @Delete('learning-center/:id')
  @ApiOperation({
    summary: "Learning Center — Davomatni o'chirish",
    description: "O'z markaziga tegishli davomat yozuvini butunlay o'chiradi.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: "O'chirilishi kerak bo'lgan davomat ID raqami",
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: "Davomat muvaffaqiyatli o'chirildi",
    schema: { example: DELETE_SUCCESS_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat topilmadi',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: {
      example: { statusCode: 401, message: 'Unauthorized' },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: {
      example: { statusCode: 403, message: 'Forbidden resource' },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
