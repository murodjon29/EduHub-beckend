import { Controller, Get, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from '../../core/entities/request-log.entity';

@ApiTags('Admin/Logs')
@Controller('admin/logs')
export class LogsController {
  constructor(
    @InjectRepository(RequestLog) private reqLogRepo: Repository<RequestLog>,
  ) {}

  @Get('file')
  @ApiOperation({ summary: 'Oxirgi log faylni o‘qish (oxirgi N qat)' })
  @ApiQuery({ name: 'lines', required: false, example: 200 })
  @ApiResponse({ status: 200, description: 'Oxirgi satrlar' })
  async tailFile(@Query('lines') lines = '200') {
    const n = Math.max(1, Math.min(5000, parseInt(lines as string, 10)));
    const logDir = process.env.LOG_FILE_DIR || './logs';
    const files = fs
      .readdirSync(logDir)
      .filter((f) => f.startsWith('app-'))
      .sort()
      .reverse();
    if (!files.length) return { data: [], message: 'No logs' };
    const filePath = path.join(logDir, files[0]);
    const content = fs.readFileSync(filePath, 'utf-8');
    const arr = content.split(/\r?\n/).filter(Boolean);
    const tail = arr.slice(-n);
    return { file: files[0], lines: tail };
  }

  @Get('db')
  @ApiOperation({ summary: 'DBdagi so‘nggi request loglarni olish' })
  @ApiQuery({ name: 'limit', required: false, example: 100 })
  async getDb(@Query('limit') limit = '100') {
    const n = Math.max(1, Math.min(1000, parseInt(limit as string, 10)));
    const rows = await this.reqLogRepo.find({
      order: { createdAt: 'DESC' },
      take: n,
    });
    return { count: rows.length, data: rows };
  }
}
