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
  // Guruh nomi uchun maydon
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Guruhning boshlanish sanasi
  @Column({ type: 'date' })
  startDate: string;

  // Guruhning tugash  sanasi
  @Column({ type: 'date' })
  endDate: string;

  // Guruhning dars kunlarini belgilovchi maydon
  @Column({ type: 'int' })
  lessonDays: number;

  // Dars vaqti uchun maydon
  @Column({ type: 'time' })
  lessonTime: string;

  // Guruhning oylik to'lov miqdori uchun maydon
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number;

  // Guruhning faol yoki faol emasligini belgilovchi maydon
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Guruhning maksimal talaba soni uchun maydon
  @Column({ type: 'int', nullable: true })
  maxStudents: number;

  // Guruhning joylashuvi yoki xonasi uchun maydon
  @Column({ type: 'varchar', length: 255, nullable: true })
  room: string;

  // Darslik yoki qo'shimcha ma'lumotlar uchun maydon
  @Column({ type: 'text', nullable: true })
  description: string;

  // Talabalar sonini saqlash uchun maydon
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

  // LearningCenter bilan bog'lanish (Many-to-One)
  @ManyToOne(() => LearningCenter, (learningCenter) => learningCenter.groups, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'learning_center_id' })
  learningCenter: LearningCenter;

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
