import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { DEFAULT_WHATSAPP_PHONE, normalizeWhatsAppPhone } from "@/lib/storefront-settings";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Sign in to manage storefront settings." }, { status: 401 });
    }

    const snapshot = await getAdminDb().collection("settings").doc("storefront").get();
    const savedPhone = snapshot.data()?.whatsappPhone;
    const whatsappPhone = savedPhone === undefined
      ? DEFAULT_WHATSAPP_PHONE
      : normalizeWhatsAppPhone(savedPhone);

    if (!whatsappPhone) throw new Error("The saved WhatsApp number is invalid.");
    return NextResponse.json({ whatsappPhone });
  } catch (error) {
    console.error("Could not load admin storefront settings:", error);
    return NextResponse.json({ error: "Storefront settings could not be loaded." }, { status: 503 });
  }
}

export async function PATCH(request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Sign in to manage storefront settings." }, { status: 401 });
    }
  } catch (error) {
    console.error("Could not verify admin access for storefront settings:", error);
    return NextResponse.json({ error: "Admin authentication could not be verified." }, { status: 503 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "A valid JSON request is required." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Provide a WhatsApp phone number." }, { status: 400 });
  }

  const whatsappPhone = normalizeWhatsAppPhone(body.whatsappPhone);
  if (!whatsappPhone) {
    return NextResponse.json({ error: "Enter a valid phone number with its country code (8–15 digits)." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("settings").doc("storefront").set({ whatsappPhone }, { merge: true });
    return NextResponse.json({ whatsappPhone });
  } catch (error) {
    console.error("Could not save WhatsApp contact number:", error);
    return NextResponse.json({ error: "The WhatsApp contact number could not be saved." }, { status: 503 });
  }
}
