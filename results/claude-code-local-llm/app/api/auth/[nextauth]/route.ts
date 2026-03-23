import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export function GET(request: NextRequest) {
  return NextAuth(request as any) as any;
}

export function POST(request: NextRequest) {
  return NextAuth(request as any) as any;
}
