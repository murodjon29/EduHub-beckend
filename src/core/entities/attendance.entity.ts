import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Group } from './group.entity';
import { Student } from './student.entity';
import { AttendanceStatus } from '../../common/enum';
import { Teacher } from './teacher.entity';
import { Lesson } from './lesson.entity';

@Entity('attendances')
export class Attendance extends BaseModel {
  @ManyToOne(() => Group, (group) => group.attendances, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Student, (student) => student.attendances, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.attendances, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  // ✅ OneToOne → ManyToOne: bir lesson'da ko'p attendance bo'ladi
  @ManyToOne(() => Lesson, (lesson) => lesson.attendances, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'boolean', nullable: true, default: false })
  isAttended: boolean;
}
