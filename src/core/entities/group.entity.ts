import { Column, ManyToOne, OneToMany, Entity, JoinColumn } from 'typeorm';
import { GroupStudent } from './group_student.entity';
import { Attendance } from './attendance.entity';
import { BaseModel } from '../../common/database';
import { Teacher } from './teacher.entity';
import { StudentPayment } from './student-payment.entity';
import { LearningCenter } from './learning_center.entity';

@Entity('groups')
export class Group extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string; // Guruh nomi (masalan: "Ingliz tili Beginner 2024")

  @Column({ type: 'date' })
  startDate: string; // Guruh qachon boshlangan

  @Column({ type: 'date' })
  endDate: string; // Guruh qachon tugaydi

  @Column({ type: 'int' })
  lessonDays: number; // Haftada necha kun dars (1,2,3,5)

  @Column({ type: 'time' })
  lessonTime: string; // Dars soati (masalan: "15:00:00")

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice: number; // Oylik to'lov narxi

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Guruh aktivmi yoki arxivlanganmi

  @Column({ type: 'int', nullable: true })
  maxStudents: number; // Guruhga maksimal qancha o'quvchi olish mumkin

  @Column({ type: 'varchar', length: 255, nullable: true })
  room: string; // Xona raqami yoki nomi

  @Column({ type: 'text', nullable: true })
  description: string; // Qo'shimcha ma'lumotlar

  @Column({ type: 'int' })
  currentStudents: number; // Hozirgi o'quvchilar soni

  // ---------- Relationships ----------

  // Teacher bilan bog'lanish (Many-to-One)
  @ManyToOne(() => Teacher, (teacher) => teacher.groups, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher; // Guruhga biriktirilgan o'qituvchi

  @Column({ type: 'int', nullable: true })
  teacherId: number; // O'qituvchining ID si (foreign key) - UUID emas, number

  // LearningCenter bilan bog'lanish (Many-to-One)
  @ManyToOne(() => LearningCenter, (learningCenter) => learningCenter.groups, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'learning_center_id' })
  learningCenter: LearningCenter; // Qaysi o'quv markaziga tegishli

  @Column({ type: 'int', nullable: false })
  learningCenterId: number; // O'quv markazi ID si

  // GroupStudent bilan bog'lanish (One-to-Many)
  @OneToMany(() => GroupStudent, (groupStudent) => groupStudent.group, {
    cascade: true,
  })
  groupStudents: GroupStudent[]; // Shu guruhdagi o'quvchilar ro'yxati

  // Attendance bilan bog'lanish (One-to-Many)
  @OneToMany(() => Attendance, (attendance) => attendance.group, {
    cascade: true,
  })
  attendances: Attendance[]; // Shu guruhning davomatlari

  // StudentPayment bilan bog'lanish (One-to-Many)
  @OneToMany(() => StudentPayment, (payment) => payment.group, {
    cascade: true,
  })
  payments: StudentPayment[]; // Shu guruhga oid to'lovlar
}