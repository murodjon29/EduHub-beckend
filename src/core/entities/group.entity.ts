import { Column, ManyToOne, OneToMany, Entity, JoinColumn } from 'typeorm';
import { GroupStudent } from './group_student.entity';
import { Attendance } from './attendance.entity';
import { BaseModel } from '../../common/database';
import { Teacher } from './teacher.entity';
import { StudentPayment } from './student-payment.entity';
import { LearningCenter } from './learning_center.entity';
import { Lesson } from './lesson.entity';

@Entity('groups')
export class Group extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'int' })
  lessonDays: number;

  @Column({ type: 'time' })
  lessonTime: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  maxStudents: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  room: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  currentStudents: number;

  // ---------- Relationships ----------

  // Teacher bilan bog'lanish (Many-to-One)
  @ManyToOne(() => Teacher, (teacher) => teacher.groups, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column({ type: 'int', nullable: true })
  teacherId: number;

  // LearningCenter bilan bog'lanish (Many-to-One)
  @ManyToOne(() => LearningCenter, (learningCenter) => learningCenter.groups, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'learning_center_id' })
  learningCenter: LearningCenter;

  @Column({ type: 'int', nullable: false })
  learningCenterId: number;

  // GroupStudent bilan bog'lanish (One-to-Many)
  @OneToMany(() => GroupStudent, (groupStudent) => groupStudent.group, {
    cascade: true,
  })
  groupStudents: GroupStudent[];

  // Attendance bilan bog'lanish (One-to-Many)
  @OneToMany(() => Attendance, (attendance) => attendance.group, {
    cascade: true,
  })
  attendances: Attendance[];

  // StudentPayment bilan bog'lanish (One-to-Many)
  @OneToMany(() => StudentPayment, (payment) => payment.group, {
    cascade: true,
  })
  payments: StudentPayment[];

  // ✅ Lesson bilan bog'lanish (One-to-Many) - TO'G'RILANGAN
  @OneToMany(() => Lesson, (lesson) => lesson.group, {
    cascade: true,
  })
  lessons: Lesson[];
}