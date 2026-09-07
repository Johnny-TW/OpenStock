import jwt, { type JwtPayload } from "jsonwebtoken";
import { getServerSession, type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import AzureAdProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";

type AzureClaims = JwtPayload & {
  unique_name?: string;
  upn?: string;
  email?: string;
  preferred_username?: string;
  name?: string;
  oid?: string;
};

const decodeClaims = (token?: string): AzureClaims | null => {
  if (!token) return null;
  const decoded = jwt.decode(token);
  return typeof decoded === "object" ? (decoded as AzureClaims) : null;
};

const toEnName = (email: string) => (email ? email.split("@")[0].replace("_", " ") : "User");

export const authOptions = (): NextAuthOptions => ({
  providers: [
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID as string,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid profile email",
          prompt: "consent",
          access_type: "offline",
        },
      },
    }),
  ],
  secret: process.env.SECRET,
  jwt: {
    secret: process.env.SECRET,
    async encode({ secret, token }) {
      return jwt.sign(token as JwtPayload, secret as string);
    },
    async decode({ secret, token }) {
      if (!token) return null;
      return jwt.verify(token, secret as string) as JWT;
    },
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.SESSION_TOKEN_NAME as string,
      options: {
        path: "/",
      },
    },
  },
  debug: false,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;

        if (account.provider === "azure-ad") {
          token.azureAccessToken = account.access_token;
        }

        if (account.provider === "google") {
          const email = profile?.email ?? "";
          const enName = toEnName(email);

          token.userProfile = {
            email,
            name: profile?.name ?? enName,
            enName,
            oid: profile?.sub ?? "",
            sub: profile?.sub ?? "",
            iss: "accounts.google.com",
          };
        } else {
          const azureProfile = profile as (typeof profile & { oid?: string }) | undefined;
          const decoded = decodeClaims(account.access_token);
          const email =
            profile?.email ??
            decoded?.unique_name ??
            decoded?.upn ??
            decoded?.email ??
            decoded?.preferred_username ??
            "";
          const enName = toEnName(email);

          token.userProfile = {
            email,
            name: profile?.name ?? decoded?.name ?? enName,
            enName,
            oid: azureProfile?.oid ?? decoded?.oid ?? "",
            sub: profile?.sub ?? decoded?.sub ?? "",
            iss: decoded?.iss ?? "",
          };
        }
      }

      return {
        accessToken: token.accessToken,
        azureAccessToken: token.azureAccessToken,
        userProfile: token.userProfile,
        provider: token.provider,
      };
    },
    async session({ session, token }) {
      let accessToken = token.accessToken;
      let error: string | undefined;

      const handle = () => {
        const profile = token.userProfile;

        if (profile) {
          session.user = {
            email: profile.email,
            name: profile.name,
            enName: profile.enName,
            iss: profile.iss,
            sub: profile.sub,
            oid: profile.oid,
          };

          accessToken = jwt.sign(session.user, process.env.JWT_SECRET as string, {
            expiresIn: "3h",
          });
          return;
        }

        if (!token.accessToken) {
          error = "沒有存取權杖，請重新登入。";
          return;
        }

        const decoded = decodeClaims(token.accessToken);
        if (!decoded) {
          error = "無法解析權杖，請重新登入。";
          return;
        }

        const email =
          decoded.unique_name ?? decoded.upn ?? decoded.email ?? decoded.preferred_username ?? "";
        const enName = toEnName(email);

        session.user = {
          email,
          name: decoded.name ?? enName,
          enName,
          iss: decoded.iss ?? "",
          sub: decoded.sub ?? "",
          oid: decoded.oid ?? "",
        };

        accessToken = jwt.sign(session.user, process.env.JWT_SECRET as string, {
          expiresIn: "3h",
        });
      };

      try {
        handle();
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }

      if (error) session.error = error;
      session.accessToken = accessToken;
      session.azureAccessToken = token.azureAccessToken;
      session.provider = token.provider;
      return session;
    },
  },
});

export const getServerAuthSession = () => getServerSession(authOptions());
