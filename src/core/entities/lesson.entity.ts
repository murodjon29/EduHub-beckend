import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseModel } from "../../common/database";
import { Group } from "./group.entity";
import { Teacher } from "./teacher.entity";

@Entity('lessons')
export class Lesson extends BaseModel {
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'date', nullable: true })
    lessonDate: string; // Dars sanasi

    @Column({ type: 'time', nullable: true })
    startTime: string; // Boshlanish vaqti

    @Column({ type: 'time', nullable: true })
    endTime: string; // Tugash vaqti

    @Column({ type: 'boolean', default: false })
    isCompleted: boolean; // Dars o'tildimi?

    // Group bilan bog'lanish (Many-to-One)
    @ManyToOne(() => Group, (group) => group.lessons, {
        onDelete: 'CASCADE',
        nullable: false,
    })
    @JoinColumn({ name: 'group_id' })
    group: Group;

    @Column({ type: 'int', nullable: false })
    groupId: number;

    // Teacher bilan bog'lanish (Many-to-One)
    @ManyToOne(() => Teacher, (teacher) => teacher.lessons, {
        onDelete: 'SET NULL',
        nullable: true,
    })
    @JoinColumn({ name: 'teacher_id' })
    teacher: Teacher;

    @Column({ type: 'int', nullable: true })
    teacherId: number;
}