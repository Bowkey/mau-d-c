import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCategoryLabel, normalizeCategoryId, PRODUCT_CATEGORIES } from "@/lib/catalog";
import { getAdminDb } from "@/lib/firebase-admin";

function validProduct(body) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  return (
    typeof body.title === "string" &&
    body.title.trim().length > 0 &&
    body.title.trim().length <= 120 &&
    typeof body.description === "string" &&
    body.description.trim().length > 0 &&
    body.description.trim().length <= 2000 &&
    Number.isSafeInteger(body.price) &&
    body.price > 0 &&
    body.price <= 100_000_000 &&
    typeof body.isPublished === "boolean" &&
    PRODUCT_CATEGORIES.some(({ id }) => id === body.category) &&
    Array.isArray(body.images) &&
    body.images.length >= 1 &&
    body.images.length <= 5 &&
    body.images.every((url) =>
      typeof url === "string" &&
      url.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`)
    )
  );
}

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
    }

    const snapshot = await getAdminDb().collection("products").get();
    const products = snapshot.docs
      .map((document) => {
        const product = document.data();
        const category = normalizeCategoryId(product.category);
        return { id: document.id, ...product, category, categoryLabel: getCategoryLabel(category) };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Could not load admin products:", error);
    return NextResponse.json({ error: "Product listings could not be loaded." }, { status: 503 });
  }
}

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to create a product." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body) || !validProduct(body)) {
    return NextResponse.json({ error: "Check the product details and include 1–5 Cloudinary images." }, { status: 400 });
  }

  try {
    const product = {
      title: body.title.trim(),
      description: body.description.trim(),
      price: body.price,
      category: body.category,
      images: body.images,
      isPublished: body.isPublished,
      createdAt: Date.now(),
    };
    const reference = await getAdminDb().collection("products").add(product);
    return NextResponse.json({ product: { id: reference.id, ...product } }, { status: 201 });
  } catch (error) {
    console.error("Could not save product:", error);
    return NextResponse.json({ error: "The product could not be saved." }, { status: 503 });
  }
}
