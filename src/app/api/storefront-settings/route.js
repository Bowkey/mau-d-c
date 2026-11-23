import { NextResponse } from "next/server";
import { DEFAULT_WHATSAPP_PHONE, normalizeWhatsAppPhone } from "@/lib/storefront-settings";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("settings").doc("storefront").get();
    const savedPhone = snapshot.data()?.whatsappPhone;
    const whatsappPhone = savedPhone === undefined
      ? DEFAULT_WHATSAPP_PHONE
      : normalizeWhatsAppPhone(savedPhone);

    if (!whatsappPhone) throw new Error("The saved WhatsApp number is invalid.");
    return NextResponse.json({ whatsappPhone });
  } catch (error) {
    console.error("Could not load the WhatsApp contact number:", error);
    return NextResponse.json({ error: "The WhatsApp contact number is unavailable." }, { status: 503 });
  }
}
