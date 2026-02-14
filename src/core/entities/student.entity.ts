import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { GroupStudent } from './group_student.entity';
import { Attendance } from './attendance.entity';
import { BaseModel } from '../../common/database';
import { StudentPayment } from './student-payment.entity';
import { LearningCenter } from './learning_center.entity';

@Entity('students')
export class Student extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  parentPhone: string;

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  //ManyToOne - cascade remove YO'Q
  @ManyToOne(() => LearningCenter, (learningCenter) => learningCenter.students, {
    onDelete: 'CASCADE', // FAQAT shu tomonda cascade remove
    onUpdate: 'CASCADE',
  })
  learningCenter: LearningCenter;

  @Column({ type: 'int', nullable: false })
  learningCenterId: number;

  @OneToMany(() => GroupStudent, (gs) => gs.student, {
    cascade: true,
  })
  groupStudents: GroupStudent[];

  @OneToMany(() => Attendance, (e) => e.student, {
    cascade: true,
  })
  attendances: Attendance[];

  @OneToMany(() => StudentPayment, (sp) => sp.student, {
    cascade: true,
  })
  payments: StudentPayment[];
}