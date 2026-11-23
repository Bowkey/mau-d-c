import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCategoryLabel, normalizeCategoryId, PRODUCT_CATEGORIES } from "@/lib/catalog";
import { getAdminDb } from "@/lib/firebase-admin";
import { isValidProduct } from "@/lib/product-validation";

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

  if (!body || typeof body !== "object" || Array.isArray(body) || !isValidProduct(body)) {
    return NextResponse.json({ error: "Check the product details and include no more than 5 Cloudinary images." }, { status: 400 });
  }

  try {
    const product = {
      title: body.title.trim(),
      description: body.description.trim(),
      price: body.price,
      category: body.category,
      images: body.images ?? [],
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
