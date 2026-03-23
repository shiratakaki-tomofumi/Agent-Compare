import NextAuth from "next-auth";
import { authOptions } from "./auth";

export const getServerSession = () => NextAuth(authOptions) as any;

export type Session = Awaited<ReturnType<typeof getServerSession>>;
