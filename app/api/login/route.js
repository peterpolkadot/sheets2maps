import { NextResponse } from "next/server";

export async function POST(req) {
  const { password } = await req.json();
  const SITE_PASSWORD = process.env.SITE_PASSWORD;

  if (!SITE_PASSWORD || password !== SITE_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("site-auth", SITE_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7
  });

  return res;
}