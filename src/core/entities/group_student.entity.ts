import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseModel } from '../../common/database';
import { GroupStudentStatus } from '../../common/enum';
import { Student } from './student.entity';
import { Group } from './group.entity';

@Entity('group_students')
@Unique(['group', 'student']) // Bir student bir guruhga faqat bir marta qo'shilishi mumkin
export class GroupStudent extends BaseModel {
  @ManyToOne(() => Group, (group) => group.groupStudents, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group; // Qaysi guruhga qo'shilgan

  @ManyToOne(() => Student, (student) => student.groupStudents, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'student_id' })
  student: Student; // Qaysi o'quvchi qo'shilgan

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  joinedAt: string; // Guruhga qachon qo'shilgan

  @Column({
    type: 'enum',
    enum: GroupStudentStatus,
    default: GroupStudentStatus.ACTIVE,
  })
  status: GroupStudentStatus; // Guruhdagi holati: Active/Arxivlangan/Bloklangan

  @Column({ type: 'date', nullable: true })
  leftAt: string; // Guruhdan qachon chiqqan (agar chiqqan bo'lsa)
}
