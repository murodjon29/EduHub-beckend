import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Group } from './group.entity';
import { Teacher } from './teacher.entity';
import { Attendance } from './attendance.entity';

@Entity('lessons')
export class Lesson extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  lessonDate: string;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @ManyToOne(() => Group, (group) => group.lessons, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive'],
    default: 'active',
    nullable: true,
  })
  status: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.lessons, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  // ✅ OneToOne → OneToMany
  @OneToMany(() => Attendance, (attendance) => attendance.lesson)
  attendances: Attendance[];
}
