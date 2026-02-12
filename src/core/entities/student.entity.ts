import { Column, Entity, OneToMany } from 'typeorm';
import { GroupStudent } from './group_student.entity';
import { Attendance } from './attendance.entity';
import { BaseModel } from '../../common/database';
import { StudentPayment } from './student-payment.entity';

@Entity('students')
export class Student extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  fullName: string; // O'quvchining to'liq ismi

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string; // Telefon raqami

  @Column({ type: 'varchar', length: 20, unique: true })
  parentPhone: string; // Ota-onasining telefon raqami

  @Column({ type: 'date' })
  birthDate: string; // Tug'ilgan sanasi

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Hali o'qiyaptimi yoki ketganmi

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string; // Yashash manzili

  @OneToMany(() => GroupStudent, (gs) => gs.student, {
    cascade: true,
  })
  groupStudents: GroupStudent[]; // Qatnashayotgan guruhlari

  @OneToMany(() => Attendance, (e) => e.student, {
    cascade: true,
  })
  attendances: Attendance[]; // Davomatlari

  @OneToMany(() => StudentPayment, (sp) => sp.student, {
    cascade: true,
  })
  payments: StudentPayment[]; // To'lovlari
}
