import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  const mockPayload = {
    sub: 'user-123',
    iss: 'azure-ad',
    oid: 'oid-abc',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    email: 'test@example.com',
    name: '測試使用者',
    enName: 'Test User',
  };

  function createMockContext(authHeader?: string): ExecutionContext {
    const request: Record<string, unknown> = {
      headers: { authorization: authHeader },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    guard = new AuthGuard(jwtService);
  });

  it('應在 token 有效時通過驗證', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);
    const ctx = createMockContext('Bearer valid-token');

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('應在驗證通過後將 payload 放入 request.user', async () => {
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockPayload);
    const ctx = createMockContext('Bearer valid-token');

    await guard.canActivate(ctx);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(request.user).toEqual(mockPayload);
  });

  it('應在沒有 Authorization header 時拋出 UnauthorizedException', async () => {
    const ctx = createMockContext(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('應在 header 格式錯誤（無 Bearer）時拋出 UnauthorizedException', async () => {
    const ctx = createMockContext('InvalidFormat');
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('應在 token 無效時拋出 UnauthorizedException', async () => {
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('invalid token'));
    const ctx = createMockContext('Bearer bad-token');

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});
