import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// We export this object so we can use it in 'app/page.jsx' to get the session
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // 1. Get the list of users from the Environment Variable
        let allowedUsers = [];
        try {
          allowedUsers = JSON.parse(process.env.APP_USERS || "[]");
        } catch (e) {
          console.error("Error parsing APP_USERS env var", e);
          return null;
        }

        // 2. Find if the user exists in that list
        const user = allowedUsers.find(
          (u) => u.username === credentials.username && u.password === credentials.password
        );

        if (user) {
          // User found! Return their name
          return { id: user.username, name: user.username };
        } else {
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
