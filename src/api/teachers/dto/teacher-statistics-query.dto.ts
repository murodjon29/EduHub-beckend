import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class TeacherStatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Boshlanish sanasi',
    example: '2026-04-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Tugash sanasi',
    example: '2026-04-30',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
