import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface AuthUserProfile {
    email: string;
    name: string;
    enName: string;
    iss: string;
    sub: string;
    oid: string;
  }

  interface Session {
    user: AuthUserProfile;
    accessToken?: string;
    azureAccessToken?: string;
    provider?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    azureAccessToken?: string;
    provider?: string;
    userProfile?: {
      email: string;
      name: string;
      enName: string;
      oid: string;
      sub: string;
      iss: string;
    };
  }
}
