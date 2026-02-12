import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Teacher } from './teacher.entity';

@Entity('teacher_salaries')
@Unique(['teacher', 'month', 'year'])
export class TeacherSalary extends BaseModel {
  @ManyToOne(() => Teacher, (teacher) => teacher.salaries, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
  /*
        VAZIFASI: 
        Bu maosh qaysi o'qituvchiga tegishli ekanligini ko'rsatadi
        Teacher jadvali bilan bog'lanadi
    */

  @Column({ type: 'uuid' })
  teacherId: string;
  /*
        VAZIFASI: 
        Teacher jadvalidagi ID ni saqlaydi
        Foreign key - tez qidirish va bog'lash uchun
    */

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  salary: number;
  /*
        VAZIFASI: 
        O'qituvchining asosiy oylik maoshi
        Masalan: 2 000 000 so'm
    */

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  date: string;
  /*
        VAZIFASI: 
        Maosh to'langan sana
        Masalan: 2024-01-15
    */

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonus: number;
  /*
        VAZIFASI: 
        O'qituvchiga berilgan qo'shimcha mukofot
        Masalan: 300 000 so'm
    */

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  penalty: number;
  /*
        VAZIFASI: 
        O'qituvchidan ushlab qolingan jarima
        Masalan: 50 000 so'm
    */

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  finalSalary: number;
  /*
        VAZIFASI: 
        O'qituvchining qo'liga tegadigan yakuniy maosh
        Formula: salary + bonus - penalty
    */

  @Column({ type: 'int' })
  month: number;
  /*
        VAZIFASI: 
        Qaysi oy uchun maosh to'lanayotgani
        1 - Yanvar, 2 - Fevral, ..., 12 - Dekabr
    */

  @Column({ type: 'int' })
  year: number;
  /*
        VAZIFASI: 
        Qaysi yil uchun maosh to'lanayotgani
        Masalan: 2024, 2025
    */
}
