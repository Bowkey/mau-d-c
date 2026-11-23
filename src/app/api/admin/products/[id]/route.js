import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminDb } from "@/lib/firebase-admin";
import { isValidProduct } from "@/lib/product-validation";

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

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Check the product details and include no more than 5 Cloudinary images." }, { status: 400 });
  }

  const publicationToggle = Object.keys(body).length === 1 && typeof body.isPublished === "boolean";
  if (!publicationToggle && !isValidProduct(body)) {
    return NextResponse.json({ error: "Check the product details and include no more than 5 Cloudinary images." }, { status: 400 });
  }

  try {
    const { id } = await params;
    const reference = getAdminDb().collection("products").doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: "This product could not be found." }, { status: 404 });
    }
    const updates = publicationToggle
      ? { isPublished: body.isPublished }
      : {
        title: body.title.trim(),
        description: body.description.trim(),
        price: body.price,
        category: body.category,
        images: body.images ?? [],
        isPublished: body.isPublished,
      };
    await reference.update(updates);
    return NextResponse.json({ id, ...updates });
  } catch (error) {
    console.error("Could not update product:", error);
    return NextResponse.json({ error: "The product could not be updated." }, { status: 503 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to manage products." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const reference = getAdminDb().collection("products").doc(id);
    const snapshot = await reference.get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: "This product could not be found." }, { status: 404 });
    }
    await reference.delete();
    return NextResponse.json({ id });
  } catch (error) {
    console.error("Could not delete product:", error);
    return NextResponse.json({ error: "The product could not be deleted." }, { status: 503 });
  }
}
