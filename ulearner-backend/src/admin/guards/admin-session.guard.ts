import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as unknown as ({ adminUser?: unknown } & Partial<Request['session']>) | undefined;
    if (session?.adminUser) {
      return true;
    }
    throw new UnauthorizedException('Admin session required');
  }
}
