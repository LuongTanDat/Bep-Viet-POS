import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KHOA_VAI_TRO } from '../decorators/roles.decorator';
import { VaiTroNguoiDung } from '../../entities';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /** Kiểm tra vai trò đã giải mã từ JWT với metadata của endpoint. */
  canActivate(context: ExecutionContext): boolean {
    const choPhep = this.reflector.getAllAndOverride<VaiTroNguoiDung[]>(KHOA_VAI_TRO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!choPhep?.length) return true;
    const request = context.switchToHttp().getRequest();
    if (choPhep.includes(request.user?.vaiTro)) return true;
    throw new ForbiddenException('Bạn không có quyền thực hiện thao tác này.');
  }
}
