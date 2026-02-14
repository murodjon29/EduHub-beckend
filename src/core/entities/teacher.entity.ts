import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Role } from '../../common/enum';
import { LearningCenter } from './learning_center.entity';
import { Group } from './group.entity';
import { Attendance } from './attendance.entity';
import { TeacherSalary } from './teacher_salary.entity';

@Entity('teachers')
export class Teacher extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string; // O'qituvchining ismi

  @Column({ type: 'varchar', length: 255 })
  lastName: string; // O'qituvchining familiyasi

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string; // Telefon raqami

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  salary: number; // Asosiy oylik maoshi

  @Column({ type: 'enum', enum: Role, default: Role.TEACHER })
  role: Role; // Roli (TEACHER, ADMIN, SUPER_ADMIN)

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Hali ishlayaptimi yoki ketganmi

  @Column({ type: 'varchar', length: 50, unique: true })
  login: string; // Tizimga kirish logini

  // O'qituvchi qaysi fan bo'yicha dars beradi (masalan, Matematika, Ingliz tili, Fizika va h.k.)
  @Column()
  subject: string;


  @Column({ type: 'varchar', length: 255 })
  password: string; // Parol (hashlangan)

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string; // Email manzili

  @ManyToOne(
    () => LearningCenter,
    (learningCenter) => learningCenter.teachers,
    {
      onDelete: 'SET NULL',
      nullable: true,
    },
  )
  @JoinColumn({ name: 'learning_center_id' })
  learningCenter: LearningCenter; // Qaysi o'quv markazda ishlaydi

  @Column({ type: 'uuid', nullable: true })
  learningCenterId: string; // O'quv markaz ID si (foreign key)

  @OneToMany(() => Group, (group) => group.teacher, {
    cascade: true,
  })
  groups: Group[]; // Dars beradigan guruhlari

  @OneToMany(() => Attendance, (attendance) => attendance.teacher, {
    cascade: true,
  })
  attendances: Attendance[]; // Dars o'tgan kunlarning davomati

  @OneToMany(() => TeacherSalary, (teacherSalary) => teacherSalary.teacher, {
    // DIQQAT: 'salary' emas, 'teacherSalary' yoki 'ts'
    cascade: true,
  })
  salaries: TeacherSalary[]; // Oylik maoshlari tarixi
}
