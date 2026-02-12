import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/database';
import { Teacher } from './teacher.entity';
import { Role } from '../../common/enum';

@Entity('learning_centers')
export class LearningCenter extends BaseModel {
  @Column({ type: 'varchar', length: 255 })
  name: string; // O'quv markaz nomi

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string; // Markaz emaili (login uchun)

  @Column({ type: 'varchar', length: 20 })
  phone: string; // Aloqa telefoni

  @Column({ type: 'varchar', length: 255 })
  password: string; // Parol (hashlangan)

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string; // Markaz logosi/rasmi (URL yoki path)

  @Column({ type: 'varchar', length: 50, unique: true })
  login: string; // Tizimga kirish logini

  @OneToMany(() => Teacher, (teacher) => teacher.learningCenter, {
    cascade: true,
  })
  teachers: Teacher[]; // Shu markazdagi o'qituvchilar

  @Column({ type: 'enum', enum: Role, default: Role.LEARNING_CENTER })
  role: Role.LEARNING_CENTER; // Roli (LEARNING_CENTER, TEACHER, ADMIN, SUPER_ADMIN)

  @Column({ type: 'boolean', default: false })
  is_blocked: boolean; // Markaz bloklanganmi yoki faolmi
}
