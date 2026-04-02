import { getServerSession } from "next-auth"
import AzureAdProvider from "next-auth/providers/azure-ad"
import GoogleProvider from "next-auth/providers/google"
import jwt from "jsonwebtoken"

export const authOptions = (req) => ({
  providers: [
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid profile email User.Read",
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      return jwt.sign(token, secret)
    },
    async decode({ secret, token }) {
      return jwt.verify(token, secret)
    },
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.SESSION_TOKEN_NAME,
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
        token.accessToken = account?.access_token
        token.provider = account.provider

        if (account.provider === "azure-ad") {
          token.azureAccessToken = account?.access_token
        }

        if (account.provider === "google") {
          const email = profile?.email ?? ""
          const enName = email
            ? email.split("@")[0].replace("_", " ")
            : "User"

          token.userProfile = {
            email,
            name: profile?.name ?? enName,
            enName,
            oid: profile?.sub ?? "",
            sub: profile?.sub ?? "",
            iss: "accounts.google.com",
          }
        } else {
          const decoded = jwt.decode(account.access_token)
          const email =
            profile?.email ??
            decoded?.unique_name ??
            decoded?.upn ??
            decoded?.email ??
            decoded?.preferred_username ??
            ""
          const enName = email
            ? email.split("@")[0].replace("_", " ")
            : "User"

          token.userProfile = {
            email,
            name: profile?.name ?? decoded?.name ?? enName,
            enName,
            oid: profile?.oid ?? decoded?.oid ?? "",
            sub: profile?.sub ?? decoded?.sub ?? "",
            iss: decoded?.iss ?? "",
          }
        }
      }
      return {
        accessToken: token.accessToken,
        azureAccessToken: token.azureAccessToken,
        userProfile: token.userProfile,
        provider: token.provider,
      }
    },
    async session({ session, token }) {
      let accessToken = token?.accessToken
      let error

      const handle = async () => {
        const profile = token?.userProfile
        if (profile) {
          session.user = {
            email: profile.email,
            name: profile.name,
            enName: profile.enName,
            iss: profile.iss,
            sub: profile.sub,
            oid: profile.oid,
          }

          accessToken = jwt.sign(session.user, process.env.JWT_SECRET, {
            expiresIn: "3h",
          })
        } else if (!token?.accessToken) {
          error = "No access token, please login again."
        } else {
          const decoded = jwt.decode(token.accessToken)
          if (decoded) {
            const email =
              decoded.unique_name ??
              decoded.upn ??
              decoded.email ??
              decoded.preferred_username
            const enName = email
              ? email.split("@")[0].replace("_", " ")
              : "User"

            session.user = {
              email,
              name: decoded.name || enName,
              enName,
              iss: decoded.iss,
              sub: decoded.sub,
              oid: decoded.oid,
            }

            accessToken = jwt.sign(session.user, process.env.JWT_SECRET, {
              expiresIn: "3h",
            })
          } else {
            error = "Unable to decode token, please login again."
          }
        }
      }

      try {
        await handle()
      } catch (e) {
        error = e?.message ?? `${e}`
      }

      if (error) session.error = error
      session.accessToken = accessToken
      session.azureAccessToken = token?.azureAccessToken
      session.provider = token?.provider
      return session
    },
  },
  events: {
    async error(message) {
      console.error("error", message)
    },
  },
})

export const getServerAuthSession = () => getServerSession(authOptions)
