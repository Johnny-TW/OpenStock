import { JwtPayload } from './jwt-payload.interface';

export interface UserPayload extends JwtPayload {
  email: string;
  name: string;
  enName: string;
}
