/**
 * NextAuth 設定
 * 實際 provider / callback 請依專案需求調整
 */
export function authOptions(req, res) {
  return {
    providers: [],
    callbacks: {},
    secret: process.env.NEXTAUTH_SECRET,
  }
}
