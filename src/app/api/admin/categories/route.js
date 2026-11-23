import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  DEFAULT_CATEGORY_VISIBILITY,
  normalizeCategoryVisibility,
} from "@/lib/catalog";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Sign in to manage shop categories." }, { status: 401 });
    }

    const snapshot = await getAdminDb().collection("settings").doc("storefront").get();
    return NextResponse.json({
      availability: normalizeCategoryVisibility(snapshot.data()?.categoryAvailability),
    });
  } catch (error) {
    console.error("Could not load category availability:", error);
    return NextResponse.json({ error: "Category settings could not be loaded." }, { status: 503 });
  }
}

export async function PATCH(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Sign in to manage shop categories." }, { status: 401 });
    }
  } catch (error) {
    console.error("Could not verify admin access for category settings:", error);
    return NextResponse.json({ error: "Admin authentication could not be verified." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    !Object.hasOwn(DEFAULT_CATEGORY_VISIBILITY, body.id) ||
    typeof body.available !== "boolean"
  ) {
    return NextResponse.json({ error: "Choose a valid category and availability status." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const reference = db.collection("settings").doc("storefront");
    const availability = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);
      const current = normalizeCategoryVisibility(snapshot.data()?.categoryAvailability);
      current[body.id] = body.available;
      transaction.set(reference, { categoryAvailability: current }, { merge: true });
      return current;
    });
    return NextResponse.json({ availability });
  } catch (error) {
    console.error("Could not update category availability:", error);
    return NextResponse.json({ error: "Category availability could not be updated." }, { status: 503 });
  }
}
