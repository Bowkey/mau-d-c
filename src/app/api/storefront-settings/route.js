import { NextResponse } from "next/server";
import { DEFAULT_CEO_PROFILE, DEFAULT_WHATSAPP_PHONE, normalizeCeoProfile, normalizeWhatsAppPhone } from "@/lib/storefront-settings";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("settings").doc("storefront").get();
    const settings = snapshot.data();
    const savedPhone = settings?.whatsappPhone;
    const whatsappPhone = savedPhone === undefined
      ? DEFAULT_WHATSAPP_PHONE
      : normalizeWhatsAppPhone(savedPhone);
    const ceoProfile = normalizeCeoProfile(settings?.ceoProfile ?? DEFAULT_CEO_PROFILE);

    if (!whatsappPhone) throw new Error("The saved WhatsApp number is invalid.");
    return NextResponse.json({ whatsappPhone, ceoProfile });
  } catch (error) {
    console.error("Could not load storefront settings:", error);
    return NextResponse.json({ error: "Storefront settings are unavailable." }, { status: 503 });
  }
}
