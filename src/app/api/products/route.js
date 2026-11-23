import { NextResponse } from "next/server";
import { isCategoryAvailable, normalizeCategoryId, normalizeCategoryVisibility } from "@/lib/catalog";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getAdminDb();
    const [snapshot, settings] = await Promise.all([
      db.collection("products").where("isPublished", "==", true).get(),
      db.collection("settings").doc("storefront").get(),
    ]);
    const visibility = normalizeCategoryVisibility(settings.data()?.categoryAvailability);
    const products = snapshot.docs
      .map((document) => {
        const product = document.data();
        return { id: document.id, ...product, category: normalizeCategoryId(product.category) };
      })
      .filter((product) => isCategoryAvailable(product.category, visibility))
      .sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Could not load published products:", error);
    return NextResponse.json({ error: "Product listings are unavailable." }, { status: 503 });
  }
}
