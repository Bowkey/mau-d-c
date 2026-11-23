import { NextResponse } from "next/server";
import {
  adminCookieName,
  createAdminSession,
  isAdminAuthenticated,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function GET() {
  try {
    return NextResponse.json({ authenticated: await isAdminAuthenticated() });
  } catch (error) {
    console.error("Could not check admin session:", error);
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.password !== "string" || body.password.length === 0) {
    return NextResponse.json({ error: "Enter the admin password." }, { status: 400 });
  }

  try {
    if (!verifyAdminPassword(body.password)) {
      return NextResponse.json({ error: "The password is incorrect." }, { status: 401 });
    }

    const { token, maxAge } = createAdminSession();
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(adminCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge,
    });
    return response;
  } catch (error) {
    console.error("Could not create admin session:", error);
    return NextResponse.json({ error: "Admin authentication is not configured." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(adminCookieName(), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
