import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class AddStudentToGroupDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  studentId: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  groupId: number;
}
