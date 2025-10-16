
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
   strategy: 'jwt',
  },
  providers: [],
}