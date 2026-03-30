import { UserPayload } from 'src/auth/user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
