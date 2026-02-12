import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { DataSource } from 'typeorm';
import { LastActivity } from '../../core/entities/last-activity.entity';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const repo = this.dataSource.getRepository(LastActivity);

    // JWT’dan yoki headerdan olish
    const storeId = req.user?.id || req.headers['x-store-id'] || 'unknown';
    const storeFullName =
      req.user?.fullname || req.headers['x-store-fullname'] || 'unknown';

    const activity = repo.create({
      storeId,
      storeFullName,
      apiEndpoint: req.url,
      method: req.method,
      requestedAt: new Date(),
    });

    await repo.save(activity);

    return next.handle();
  }
}
