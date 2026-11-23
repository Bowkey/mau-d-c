import { NextResponse } from "next/server";
import { normalizeCategoryVisibility } from "@/lib/catalog";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("settings").doc("storefront").get();
    return NextResponse.json({
      availability: normalizeCategoryVisibility(snapshot.data()?.categoryAvailability),
    });
  } catch (error) {
    console.error("Could not load storefront categories:", error);
    return NextResponse.json({ error: "Shop categories are unavailable." }, { status: 503 });
  }
}
