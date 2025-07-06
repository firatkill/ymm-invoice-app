import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          const { email, password } = credentials;

          if (!email || !password) {
            throw new Error("Email ve şifre gereklidir");
          }

          const dataRaw = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: "POST",
              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

          const data = await dataRaw.json();
          console.log(data);

          if (!data.success) {
            throw new Error(data?.error || "Giriş işlemi başarısız");
          }

          const { user } = data;

          // NextAuth için user objesi
          return {
            id: user.id,
            email: user.email,
          };
        } catch (error) {
          throw new Error(error.message || "Giriş işlemi başarısız");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 6, // 6 saat geçerli
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
