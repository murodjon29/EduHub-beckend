import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Group } from './group.entity';
import { Student } from './student.entity';
import { AttendanceStatus } from '../../common/enum';
import { Teacher } from './teacher.entity';

@Entity('attendances')
export class Attendance extends BaseModel {
  @ManyToOne(() => Group, (group) => group.attendances, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group; // Qaysi guruhga dars bo'lgan

  @ManyToOne(() => Student, (student) => student.attendances, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student; // Qaysi o'quvchi

  @ManyToOne(() => Teacher, (teacher) => teacher.attendances, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher; // Qaysi o'qituvchi dars o'tgan

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string; // Dars qaysi sanada bo'lgan

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status: AttendanceStatus; // O'quvchining davomati: Keldi/Kelmadi/Uzrli
}
