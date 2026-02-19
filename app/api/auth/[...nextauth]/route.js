import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // This is where we check the hardcoded values from Vercel Env Vars
        const userMatches = credentials.username === process.env.ADMIN_USER;
        const passwordMatches = credentials.password === process.env.ADMIN_PASSWORD;

        if (userMatches && passwordMatches) {
          // Any object returned will be saved in the `user` property of the JWT
          return { id: "1", name: "Admin", email: "admin@example.com" };
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login', // Custom login page
  },
  secret: process.env.NEXTAUTH_SECRET, // Required for security
});

export { handler as GET, handler as POST };
