import { getServerSession } from "next-auth"
import AzureAdProvider from "next-auth/providers/azure-ad"
import jwt from "jsonwebtoken"

export const authOptions = (req) => ({
  providers: [
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
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
    error: "/",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account?.access_token
      }
      return {
        accessToken: token.accessToken,
      }
    },
    async session({ session, token }) {
      let accessToken = token?.accessToken
      let error

      const handle = async () => {
        if (token?.accessToken) {
          const decoded = jwt.decode(token.accessToken)
          if (decoded) {
            const email = decoded.unique_name ?? decoded.upn ?? decoded.email ?? decoded.preferred_username
            const name = email ? email.split("@")[0].replace("_", " ") : "User"

            session.user = {
              email,
              name,
              enName: name,
              iss: decoded.iss,
              sub: decoded.sub,
              oid: decoded.oid,
            }

            accessToken = jwt.sign(session.user, process.env.JWT_SECRET, {
              expiresIn: "3h",
            })
          }
        } else {
          error = "No access token, please login again."
        }
      }

      try {
        await handle()
      } catch (e) {
        error = e?.message ?? `${e}`
      }

      if (error) session.error = error
      session.accessToken = accessToken
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
