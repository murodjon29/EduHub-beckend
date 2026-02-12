import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { resolve } from 'path';

// ---------- Interseptors ----------
import { ActivityInterceptor } from '../common/interseptors/activity.interseptor';

// ---------- Modules ----------
import { LearningCenterModule } from './learning_center/learning_center.module';
import { AuthModule } from './auth/auth.module';
import { TeachersModule } from './teachers/teachers.module';
import { TeacherSalariesModule } from './teacher_salaries/teacher_salaries.module';
import { GroupModule } from './group/group.module';
import { GroupStudentsModule } from './group_students/group_students.module';
import { StudentsModule } from './students/students.module';
import { StudentPaymentsModule } from './student-payments/student-payments.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LearningCenter } from '../core/entities/learning_center.entity';
import { Teacher } from '../core/entities/teacher.entity';
import { TeacherSalary } from '../core/entities/teacher_salary.entity';
import { Group } from '../core/entities/group.entity';
import { GroupStudent } from '../core/entities/group_student.entity';
import { Student } from '../core/entities/student.entity';
import { StudentPayment } from '../core/entities/student-payment.entity';
import { Attendance } from '../core/entities/attendance.entity';

// ---------- ENTITY'LARNI TO'G'RIDAN-TO'G'RI IMPORT QILISH (MUHIM! 🔴) ----------

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // ✅ TO'G'RILANGAN: Entity'lar ro'yxati bilan
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DEV_DB_URL'),
        // 🔴 MUHIM: BARCHA ENTITY'LARNI RO'YXATGA OLISH
        entities: [
          LearningCenter,
          Teacher,
          TeacherSalary,
          Group,
          GroupStudent,
          Student,
          StudentPayment,
          Attendance,
        ],
        autoLoadEntities: false, // 🔴 false qilamiz, chunki entities'ni o'zimiz ro'yxat qildik
        synchronize: true, // dev uchun
        ssl: {
          rejectUnauthorized: false,
        },
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),

    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', '..', '..', 'uploads'),
      serveRoot: '/api/v1/uploads',
    }),

    CacheModule.register({ isGlobal: true }),
    JwtModule.register({ global: true }),

    // ---------- Modules ----------
    LearningCenterModule,
    AuthModule,
    TeachersModule,
    TeacherSalariesModule,
    GroupModule,
    GroupStudentsModule,
    StudentsModule,
    StudentPaymentsModule,
    AttendanceModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: ActivityInterceptor },
  ],
})
export class AppModule {}