import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('q')
export class LastActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  storeId: string; // har bir store uchun unique ID

  @Column()
  storeFullName: string;

  @Column()
  apiEndpoint: string;

  @Column()
  method: string;

  @CreateDateColumn()
  requestedAt: Date;
}
