import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      departmentId: string | null;
      departmentName: string | null;
    };
  }

  interface User {
    role: Role;
    departmentId: string | null;
    departmentName: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    departmentId?: string | null;
    departmentName?: string | null;
  }
}
