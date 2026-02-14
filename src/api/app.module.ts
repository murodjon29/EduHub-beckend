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

// ---------- Entities ----------
import { LearningCenter } from '../core/entities/learning_center.entity';
import { Teacher } from '../core/entities/teacher.entity';
import { TeacherSalary } from '../core/entities/teacher_salary.entity';
import { Group } from '../core/entities/group.entity';
import { GroupStudent } from '../core/entities/group_student.entity';
import { Student } from '../core/entities/student.entity';
import { StudentPayment } from '../core/entities/student-payment.entity';
import { Attendance } from '../core/entities/attendance.entity';
import { LastActivity } from '../core/entities/last-activity.entity';
import { RequestLog } from '../core/entities/request-log.entity';

@Module({
  imports: [
    // Config modulini global sozlash
    ConfigModule.forRoot({ 
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database konfiguratsiyasi
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DEV_DB_URL'),
        entities: [
          LearningCenter,
          Teacher,
          TeacherSalary,
          Group,
          GroupStudent,
          Student,
          StudentPayment,
          Attendance,
          LastActivity,
          RequestLog
        ],
        autoLoadEntities: false,
        synchronize: true,
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

    // Rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),

    // Static fayllar
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', '..', '..', 'uploads'),
      serveRoot: '/api/v1/uploads',
    }),

    // Cache
    CacheModule.register({ 
      isGlobal: true 
    }),

    // JWT modulini .env dagi qiymatlar bilan sozlash
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string>('ACCESS_TOKEN_TIME') || '24h';
        
        return {
          secret: configService.get<string>('ACCESS_TOKEN_KEY'),
          signOptions: { 
            expiresIn: expiresIn as any, // TypeScript xatoligini oldini olish
          },
        };
      },
    }),

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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityInterceptor,
    },
  ],
})
export class AppModule {}