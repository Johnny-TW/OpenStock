import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import type { Request } from 'express';
import type { UserPayload } from './user-payload.interface';

@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super(options, storageService, reflector);
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request;
    const token = request.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const payload = this.jwtService.verify<UserPayload>(token, {
          secret: process.env.JWT_SECRET,
        });
        if (payload.email) return `user:${payload.email}`;
      } catch {}
    }
    return `ip:${request.ip ?? 'unknown'}`;
  }
}
