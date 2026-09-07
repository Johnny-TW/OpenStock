import { UserPayload } from '../auth/user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
