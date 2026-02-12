import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggingService } from './logging.service';
import { LoggingMiddleware } from './logging.middleware';
import { RequestLog } from '../../core/entities/request-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
