import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Role } from '../../common/enum';
import { LearningCenter } from './learning_center.entity';
import { Group } from './group.entity';
import { Attendance } from './attendance.entity';
import { TeacherSalary } from './teacher_salary.entity';
import { Lesson } from './lesson.entity';

@Entity('teachers')
export class Teacher extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salary: number;

  @Column({ type: 'enum', enum: Role, default: Role.TEACHER })
  role: Role;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, unique: true })
  login: string;

  @Column()
  subject: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @ManyToOne(
    () => LearningCenter,
    (learningCenter) => learningCenter.teachers,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'learning_center_id' })
  learningCenter: LearningCenter;

  // 🔴 XATO: type 'uuid' emas, 'int' bo'lishi kerak
  @Column({ type: 'int', nullable: true })
  learningCenterId: number;

  @OneToMany(() => Group, (group) => group.teacher, {
    cascade: true,
  })
  groups: Group[];

  @OneToMany(() => Attendance, (attendance) => attendance.teacher, {
    cascade: true,
  })
  attendances: Attendance[];

  // ✅ Lesson bilan bog'lanish - TO'G'RILANGAN
  @OneToMany(() => Lesson, (lesson) => lesson.teacher, {
    cascade: true,
  })
  lessons: Lesson[];

  @OneToMany(() => TeacherSalary, (teacherSalary) => teacherSalary.teacher, {
    cascade: true,
  })
  salaries: TeacherSalary[];
}