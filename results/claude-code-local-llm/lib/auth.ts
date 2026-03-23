import bcrypt from "bcryptjs";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

const credentialsProvider = {
  id: "credentials",
  name: "Credentials",
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" },
  },
  type: "credential" as const,
  async authorize(credentials: any) {
    if (!credentials || !("email" in credentials) || !("password" in credentials)) {
      throw new Error("Email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
    });

    if (!user || typeof user.password !== "string") {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
};

export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  providers: [credentialsProvider],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
};

export type { Session } from "next-auth";
