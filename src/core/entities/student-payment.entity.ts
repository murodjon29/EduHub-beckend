import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Student } from './student.entity';
import { Group } from './group.entity';

@Entity('student_payments')
@Unique(['student', 'group', 'month']) // Bir o'quvchi bir guruh uchun bir oyda faqat bir to'lov
export class StudentPayment extends BaseModel {
  @ManyToOne(() => Student, (student) => student.payments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student; // To'lov qilgan o'quvchi

  @ManyToOne(() => Group, (group) => group.payments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group; // Qaysi guruh uchun to'lov

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // To'lanishi kerak bo'lgan summa (oylik to'lov)

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  paymentDate: string; // To'lov qilingan sana

  @Column({ type: 'date' })
  month: string; // Qaysi oy uchun to'lov (masalan: "2024-01-01")

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number; // Haqiqatda to'langan summa

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount: number; // Chegirma miqdori

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string; // To'lov haqida qo'shimcha izoh
}
