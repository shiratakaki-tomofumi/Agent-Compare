import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

import { canAccessPath } from "@/lib/permissions";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth.token?.role;
    if (typeof role === "string" && !canAccessPath(request.nextUrl.pathname, role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname === "/login") {
          return true;
        }

        return Boolean(token);
      }
    }
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)"]
};
