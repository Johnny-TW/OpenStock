import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserPayload } from 'src/auth/user-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request: Request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;

      if (!authHeader) throw new UnauthorizedException();

      const token = authHeader.split(' ')[1];
      if (!token) throw new UnauthorizedException();

      const payload: UserPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
