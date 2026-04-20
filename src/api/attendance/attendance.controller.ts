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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from '../../core/entities/attendance.entity';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { RolesGuard } from '../../common/guard/roles.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { Role } from '../../common/enum';

// ─── Shared Swagger Examples ────────────────────────────────────────────────

const ATTENDANCE_EXAMPLE = {
  id: 10,
  date: '2026-02-23',
  status: 'PRESENT',
  group: { id: 1, name: 'Frontend N12' },
  student: { id: 5, fullName: 'Ali Valiyev' },
  teacher: { id: 2, fullName: 'John Doe' },
  lesson: { id: 3, title: 'JavaScript Basics', date: '2026-02-23' },
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
    lesson: { id: 3, title: 'JavaScript Basics', date: '2026-02-23' },
    createdAt: '2026-02-23T08:00:00.000Z',
    updatedAt: '2026-02-23T08:00:00.000Z',
  },
];

// ─── Create response — massiv qaytadi ──────────────────────────────────────
const CREATE_RESPONSE_EXAMPLE = [
  {
    id: 10,
    date: '2026-02-23',
    status: 'PRESENT',
    group: { id: 1, name: 'Frontend N12' },
    student: { id: 5, fullName: 'Ali Valiyev' },
    teacher: { id: 2, fullName: 'John Doe' },
    lesson: { id: 3, title: 'JavaScript Basics', date: '2026-02-23' },
    createdAt: '2026-02-23T08:00:00.000Z',
    updatedAt: '2026-02-23T08:00:00.000Z',
  },
  {
    id: 11,
    date: '2026-02-23',
    status: 'ABSENT',
    group: { id: 1, name: 'Frontend N12' },
    student: { id: 6, fullName: 'Vali Karimov' },
    teacher: { id: 2, fullName: 'John Doe' },
    lesson: { id: 3, title: 'JavaScript Basics', date: '2026-02-23' },
    createdAt: '2026-02-23T08:00:00.000Z',
    updatedAt: '2026-02-23T08:00:00.000Z',
  },
  {
    // Bu student uchun shu lesson + date da davomat allaqachon bor edi → skip
    skipped: true,
    studentId: 7,
    existing: {
      id: 9,
      date: '2026-02-23',
      status: 'ABSENT',
      group: { id: 1, name: 'Frontend N12' },
      student: { id: 7, fullName: 'Sardor Rahimov' },
      teacher: { id: 2, fullName: 'John Doe' },
      lesson: { id: 3, title: 'JavaScript Basics', date: '2026-02-23' },
    },
  },
];

const NOT_FOUND_EXAMPLE = {
  statusCode: 404,
  message: 'Attendance topilmadi',
  error: 'Not Found',
};

const DUPLICATE_EXAMPLE = {
  statusCode: 400,
  message: 'Bu student uchun shu lesson va sanada davomat allaqachon mavjud',
  error: 'Bad Request',
};

const UPDATE_SUCCESS_EXAMPLE = {
  statusCode: 200,
  message: 'Attendance updated successfully',
  data: [
    {
      id: 10,
      date: '2026-03-01',
      status: 'PRESENT',
      group: { id: 1, name: 'Frontend N12' },
      student: { id: 5, fullName: 'Ali Valiyev' },
      teacher: { id: 3, fullName: 'Jane Smith' },
      lesson: { id: 4, title: 'React Hooks', date: '2026-03-01' },
    },
    {
      // Bu student uchun yangi date+lesson da duplicate topildi → skip
      skipped: true,
      studentId: 6,
      existing: {
        id: 12,
        date: '2026-03-01',
        status: 'ABSENT',
        lesson: { id: 4, title: 'React Hooks', date: '2026-03-01' },
      },
    },
  ],
};

const DELETE_SUCCESS_EXAMPLE = {
  statusCode: 200,
  message: 'Attendance muvaffaqiyatli ochirildi',
};

// ─── Create body examples ───────────────────────────────────────────────────
const CREATE_BODY_EXAMPLES = {
  multipleStudents: {
    summary: 'Bir nechta student — asosiy holat',
    value: {
      groupId: 1,
      lessonId: 3,
      teacherId: 2,
      date: '2026-02-23',
      students: [
        { studentId: 5, status: 'PRESENT' },
        { studentId: 6, status: 'ABSENT' },
        { studentId: 7, status: 'PRESENT' },
      ],
    },
  },
  singleStudent: {
    summary: 'Bitta student',
    value: {
      groupId: 1,
      lessonId: 3,
      teacherId: 2,
      date: '2026-02-23',
      students: [{ studentId: 5, status: 'PRESENT' }],
    },
  },
  withoutTeacher: {
    summary: "Teacher ko'rsatilmagan holat (ixtiyoriy)",
    value: {
      groupId: 1,
      lessonId: 3,
      date: '2026-02-23',
      students: [
        { studentId: 5, status: 'PRESENT' },
        { studentId: 6, status: 'ABSENT' },
      ],
    },
  },
  withoutDate: {
    summary: "Date ko'rsatilmasa bugungi sana olinadi",
    value: {
      groupId: 1,
      lessonId: 3,
      teacherId: 2,
      students: [
        { studentId: 5, status: 'PRESENT' },
        { studentId: 6, status: 'PRESENT' },
      ],
    },
  },
};

// ─── Update body examples ───────────────────────────────────────────────────
const UPDATE_BODY_EXAMPLES = {
  updateStatusOnly: {
    summary: "Faqat statusni o'zgartirish",
    value: {
      students: [{ studentId: 5, status: 'ABSENT' }],
    },
  },
  updateDateAndLesson: {
    summary: "Sana va lessonni o'zgartirish",
    value: {
      lessonId: 4,
      date: '2026-03-01',
      students: [
        { studentId: 5, status: 'PRESENT' },
        { studentId: 6, status: 'PRESENT' },
      ],
    },
  },
  updateTeacher: {
    summary: "Teacherni o'zgartirish",
    value: {
      teacherId: 3,
      students: [{ studentId: 5, status: 'PRESENT' }],
    },
  },
  updateAll: {
    summary: 'Barcha maydonlarni yangilash',
    value: {
      groupId: 1,
      lessonId: 4,
      teacherId: 3,
      date: '2026-03-01',
      students: [
        { studentId: 5, status: 'PRESENT' },
        { studentId: 6, status: 'ABSENT' },
      ],
    },
  },
  updateWithoutStudents: {
    summary: "Faqat asosiy yozuvni yangilash (students ko'rsatilmasa)",
    value: {
      teacherId: 3,
      date: '2026-03-01',
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
    description: `Teacher o'z guruhi uchun yangi davomat yozuvi yaratadi.
    
**Muhim qoidalar:**
- Har bir student uchun alohida status beriladi (PRESENT / ABSENT)
- Bir student uchun bir lesson + bir sanada faqat bitta davomat bo'lishi mumkin
- Duplicate bo'lsa — o'tkazib yuboriladi (skipped: true), xato emas
- \`teacherId\` va \`date\` ixtiyoriy; date berilmasa bugungi sana olinadi
- \`lessonId\` majburiy — lesson ushbu groupga tegishli bo'lishi kerak`,
  })
  @ApiBody({
    type: CreateAttendanceDto,
    examples: CREATE_BODY_EXAMPLES,
  })
  @ApiResponse({
    status: 201,
    description:
      "Davomatlar massivi qaytariladi. Duplicate bo'lganlar `skipped: true` bilan keladi.",
    schema: { example: CREATE_RESPONSE_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: 'Bu lesson ushbu groupga tegishli emas',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bu lesson ushbu groupga tegishli emas',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Group, Lesson, Student yoki Teacher topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Lesson topilmadi',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get('group/:groupId')
  @ApiOperation({
    summary: "Guruh bo'yicha barcha davomatlarni olish",
    description:
      "Berilgan groupId bo'yicha barcha davomatlarni sana kamayish tartibida qaytaradi.",
  })
  @ApiParam({
    name: 'groupId',
    type: Number,
    description: 'Guruh ID raqami',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: "Davomatlar ro'yxati muvaffaqiyatli qaytarildi",
    schema: { example: ATTENDANCE_LIST_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  findAll(
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<Attendance[]> {
    return this.attendanceService.findAll(groupId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Get(':id')
  @ApiOperation({
    summary: "Bitta davomatni ID bo'yicha olish",
    description:
      "Berilgan ID bo'yicha bitta davomat yozuvini group, student, teacher va lesson ma'lumotlari bilan qaytaradi.",
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Davomat ID raqami',
    example: 10,
  })
  @ApiQuery({
    name: 'groupId',
    type: Number,
    description: 'Guruh ID — faqat shu guruhga tegishli davomat qaytariladi',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Davomat muvaffaqiyatli topildi',
    schema: { example: ATTENDANCE_EXAMPLE },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat topilmadi yoki bu guruhga tegishli emas',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('groupId', ParseIntPipe) groupId: number,
  ): Promise<Attendance> {
    return this.attendanceService.findOne(id, groupId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @Patch(':id')
  @ApiOperation({
    summary: 'Davomatni yangilash',
    description: `Mavjud davomat yozuvini qisman yoki to'liq yangilaydi.
    
**Muhim qoidalar:**
- \`students\` berilmasa — faqat asosiy yozuv (date, teacher, lesson) yangilanadi
- \`students\` berilsa — har bir student uchun yangi davomat yozuvi topiladi yoki yaratiladi
- Duplicate bo'lsa (o'zi bundan tashqari) — \`skipped: true\` bilan o'tkaziladi
- \`lessonId\` o'zgartirilsa — yangi lesson ushbu groupga tegishli bo'lishi kerak`,
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
    description:
      "Davomat muvaffaqiyatli yangilandi. Duplicate bo'lganlar `skipped: true` bilan keladi.",
    schema: { example: UPDATE_SUCCESS_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: 'Bu lesson ushbu groupga tegishli emas',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bu lesson ushbu groupga tegishli emas',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Attendance, Group, Lesson, Student yoki Teacher topilmadi',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
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
    description: `Learning Center o'z markaziga tegishli guruh uchun yangi davomat yaratadi.
    
**Muhim qoidalar:**
- Har bir student uchun alohida status beriladi (PRESENT / ABSENT)
- \`lessonId\` majburiy — lesson ushbu groupga tegishli bo'lishi kerak
- Bir student uchun bir lesson + bir sanada faqat bitta davomat bo'lishi mumkin
- Duplicate bo'lsa — o'tkazib yuboriladi (skipped: true), xato emas`,
  })
  @ApiBody({
    type: CreateAttendanceDto,
    examples: CREATE_BODY_EXAMPLES,
  })
  @ApiResponse({
    status: 201,
    description:
      "Davomatlar massivi qaytariladi. Duplicate bo'lganlar `skipped: true` bilan keladi.",
    schema: { example: CREATE_RESPONSE_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: 'Bu lesson ushbu groupga tegishli emas',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bu lesson ushbu groupga tegishli emas',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Group, Lesson, Student yoki Teacher topilmadi',
    schema: {
      example: {
        statusCode: 404,
        message: 'Student topilmadi (id: 5)',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
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
      "JWT token orqali learningCenterId aniqlanadi va faqat o'sha markazga tegishli davomatlar sana kamayish tartibida qaytariladi.",
  })
  @ApiResponse({
    status: 200,
    description: "Davomatlar ro'yxati muvaffaqiyatli qaytarildi",
    schema: { example: ATTENDANCE_LIST_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  learningCenterFindAll(@Request() req) {
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
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
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
      "O'z markaziga tegishli davomatni qisman yoki to'liq yangilaydi. `students` berilmasa faqat asosiy yozuv yangilanadi.",
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
    description:
      "Davomat muvaffaqiyatli yangilandi. Duplicate bo'lganlar `skipped: true` bilan keladi.",
    schema: { example: UPDATE_SUCCESS_EXAMPLE },
  })
  @ApiResponse({
    status: 400,
    description: 'Bu lesson ushbu groupga tegishli emas',
    schema: {
      example: {
        statusCode: 400,
        message: 'Bu lesson ushbu groupga tegishli emas',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Davomat, Group, Lesson yoki Teacher topilmadi',
    schema: { example: NOT_FOUND_EXAMPLE },
  })
  @ApiResponse({
    status: 401,
    description: "Token berilmagan yoki noto'g'ri",
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
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
    schema: { example: { statusCode: 401, message: 'Unauthorized' } },
  })
  @ApiResponse({
    status: 403,
    description: "Ushbu amalni bajarish uchun ruxsat yo'q",
    schema: { example: { statusCode: 403, message: 'Forbidden resource' } },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }
}
