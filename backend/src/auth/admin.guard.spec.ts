import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

const createContext = (email?: string) =>
  ({
    switchToHttp: () => ({ getRequest: () => ({ user: email ? { email } : undefined }) }),
  }) as unknown as ExecutionContext;

describe('AdminGuard', () => {
  const guard = new AdminGuard();
  const original = process.env.ADMIN_EMAILS;

  afterEach(() => {
    process.env.ADMIN_EMAILS = original;
  });

  it('應放行名單內的管理員（不分大小寫）', () => {
    process.env.ADMIN_EMAILS = 'Admin@example.com, other@example.com';
    expect(guard.canActivate(createContext('admin@EXAMPLE.com'))).toBe(true);
  });

  it('應擋下不在名單內的使用者', () => {
    process.env.ADMIN_EMAILS = 'admin@example.com';
    expect(() => guard.canActivate(createContext('user@example.com'))).toThrow(ForbiddenException);
  });

  it('未設定 ADMIN_EMAILS 時任何人都不能通過', () => {
    delete process.env.ADMIN_EMAILS;
    expect(() => guard.canActivate(createContext('admin@example.com'))).toThrow(ForbiddenException);
  });

  it('沒有使用者資訊時應擋下', () => {
    process.env.ADMIN_EMAILS = 'admin@example.com';
    expect(() => guard.canActivate(createContext())).toThrow(ForbiddenException);
  });
});
