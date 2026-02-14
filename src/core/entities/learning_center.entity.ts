import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Teacher } from './teacher.entity';
import { Role } from '../../common/enum';
import { Student } from './student.entity';
import { Group } from './group.entity';

@Entity('learning_centers')
export class LearningCenter extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  login: string;

  // OneToMany - cascade remove YO'Q (Student tomonida bor)
  @OneToMany(() => Teacher, (teacher) => teacher.learningCenter, {
    cascade: true, // cascade remove emas, faqat insert/update
  })
  teachers: Teacher[];

  // OneToMany - cascade remove YO'Q (Student tomonida bor)
  @OneToMany(() => Student, (student) => student.learningCenter, {
    cascade: true, // cascade remove emas, faqat insert/update
  })
  students: Student[];

  // OneToMany - cascade remove YO'Q
  @OneToMany(() => Group, (group) => group.learningCenter, {
    cascade: true,
  })
  groups: Group[];

  @Column({ type: 'enum', enum: Role, default: Role.LEARNING_CENTER })
  role: Role;

  @Column({ type: 'boolean', default: false })
  is_blocked: boolean;
}``