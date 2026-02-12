import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('request_logs')
export class RequestLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ nullable: true })
  responseTimeMs: number;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ type: 'json', nullable: true })
  requestBody: any;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  region: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  isp: string;

  @CreateDateColumn()
  createdAt: Date;
}
