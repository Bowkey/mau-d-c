import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";

export async function PATCH(request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.isPublished !== "boolean") {
    return NextResponse.json({ error: "Publication status must be true or false." }, { status: 400 });
  }

  try {
    const { id } = await params;
    await getAdminDb().collection("products").doc(id).update({ isPublished: body.isPublished });
    return NextResponse.json({ id, isPublished: body.isPublished });
  } catch (error) {
    console.error("Could not update product publication:", error);
    return NextResponse.json({ error: "The product could not be updated." }, { status: 503 });
  }
}
