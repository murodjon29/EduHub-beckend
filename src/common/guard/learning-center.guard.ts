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

    const user = req.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    // adminlar va learning center kiradi
    if (
      user.role === AdminRoles.SUPERADMIN ||
      user.role === AdminRoles.ADMIN ||
      user.role === Role.LEARNING_CENTER
    ) {
      return true;
    }

    // o‘z id sini tekshirish
    if (req.params.id && Number(req.params.id) === user.id) {
      return true;
    }

    throw new ForbiddenException('Forbidden user');
  }
}
