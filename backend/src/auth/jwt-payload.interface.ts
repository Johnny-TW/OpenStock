export interface JwtPayload {
  sub: string;
  iss: string;
  oid: string;
  exp: number;
  iat: number;
}
