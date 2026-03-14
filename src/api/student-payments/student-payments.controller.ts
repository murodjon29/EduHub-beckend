import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { UpdateStudentPaymentDto } from './dto/update-student-payment.dto';
import { FilterStudentPaymentDto } from './dto/filter-student-payment.dto';
import { StudentPaymentService } from './student-payments.service';
import { JwtGuard } from '../../common/guard/jwt-auth.guard';
import { SelfGuard } from '../../common/guard/self.guard';

@ApiTags('Student Payments')
@Controller('student-payments')
export class StudentPaymentController {
  constructor(private readonly paymentService: StudentPaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Student uchun yangi tolov yaratish' })
  @ApiBody({
    type: CreateStudentPaymentDto,
    examples: {
      example1: {
        summary: 'Oddiy tolov',
        value: {
          student_id: 1,
          group_id: 2,
          amount: 500000,
          paidAmount: 500000,
          discount: 0,
          month: '2025-03-01',
          description: 'Mart oyi uchun tolov',
          learningCenterId: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tolov muvaffaqiyatli yaratildi',
    schema: {
      example: {
        id: 10,
        student: {
          id: 1,
          fullName: 'Ali Valiyev',
        },
        group: {
          id: 2,
          name: 'Backend N1',
        },
        amount: 500000,
        paidAmount: 500000,
        discount: 0,
        month: '2025-03-01',
        paymentDate: '2025-03-08',
        description: 'Mart oyi uchun tolov',
      },
    },
  })
  create(@Body() dto: CreateStudentPaymentDto) {
    return this.paymentService.create(dto);
  }

  @Get(':learningCenterId')
  @ApiOperation({ summary: 'Student tolovlarini olish (filter bilan)' })
  @ApiQuery({ name: 'student_id', required: false, example: 1 })
  @ApiQuery({ name: 'group_id', required: false, example: 2 })
  @ApiQuery({ name: 'month', required: false, example: '2025-03-01' })
  @ApiResponse({
    status: 200,
    description: 'Tolovlar royxati',
    schema: {
      example: [
        {
          id: 1,
          amount: 500000,
          paidAmount: 500000,
          discount: 0,
          month: '2025-03-01',
          student: {
            id: 1,
            fullName: 'Ali Valiyev',
          },
          group: {
            id: 2,
            name: 'Backend N1',
          },
        },
      ],
    },
  })
  findAll(
    @Param('learningCenterId', ParseIntPipe) learningCenterId: number,
    @Query() filterDto: FilterStudentPaymentDto,
  ) {
    return this.paymentService.findAll(learningCenterId, filterDto);
  }
  @UseGuards(JwtGuard, SelfGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Bitta tolovni olish' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Tolov topildi',
    schema: {
      example: {
        id: 1,
        amount: 500000,
        paidAmount: 500000,
        discount: 0,
        month: '2025-03-01',
        student: {
          id: 1,
          fullName: 'Ali Valiyev',
        },
        group: {
          id: 2,
          name: 'Backend N1',
        },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }
  @UseGuards(JwtGuard, SelfGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Tolovni yangilash' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({
    type: UpdateStudentPaymentDto,
    examples: {
      example1: {
        value: {
          paidAmount: 400000,
          discount: 100000,
          description: 'Chegirma bilan tolandi',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tolov yangilandi',
    schema: {
      example: {
        id: 1,
        amount: 500000,
        paidAmount: 400000,
        discount: 100000,
        month: '2025-03-01',
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStudentPaymentDto,
  ) {
    return this.paymentService.update(id, dto);
  }

  @UseGuards(JwtGuard, SelfGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Tolovni ochirish' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Tolov ochirildi',
    schema: {
      example: {
        message: 'Tolov ochirildi',
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.remove(id);
  }
}
