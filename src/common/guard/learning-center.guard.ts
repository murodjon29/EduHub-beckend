import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AdminRoles, Role } from '../enum';

@Injectable()
export class LearningCenterGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (
      req.user?.role ||
      req.user?.role === AdminRoles.SUPERADMIN ||
      req.user?.role === AdminRoles.ADMIN ||
      req.user?.role === Role.LEARNING_CENTER
    ) {
      return true;
    }
    if (req.params.id !== req.user.id) {
      throw new ForbiddenException('Forbidden user');
    }
    return true;
  }
}
