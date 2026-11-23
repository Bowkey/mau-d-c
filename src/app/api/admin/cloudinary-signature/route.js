import { randomUUID } from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Sign in to upload images." }, { status: 401 });
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
    !Number.isInteger(body.count) ||
    body.count < 1 ||
    body.count > 5 ||
    (body.purpose !== undefined && !["products", "ceo"].includes(body.purpose))
  ) {
    return NextResponse.json({ error: "Request between 1 and 5 image signatures." }, { status: 400 });
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  const signatures = Array.from({ length: body.count }, () => {
    const params = {
      allowed_formats: "jpg,png,webp,avif",
      folder: body.purpose === "ceo" ? "mau-Collections/ceo" : "mau-Collections/products",
      overwrite: false,
      public_id: randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
    };
    return {
      ...params,
      signature: cloudinary.utils.api_sign_request(params, CLOUDINARY_API_SECRET),
    };
  });

  return NextResponse.json({
    cloudName: CLOUDINARY_CLOUD_NAME,
    apiKey: CLOUDINARY_API_KEY,
    signatures,
  });
}
