import { NextResponse } from "next/server";
import {
  DEFAULT_ANNOUNCEMENT,
  DEFAULT_CEO_PROFILE,
  DEFAULT_SHOP_ADDRESS,
  DEFAULT_WHATSAPP_PHONE,
  normalizeAnnouncement,
  normalizeCeoProfile,
  normalizeShopAddress,
  normalizeWhatsAppPhone,
} from "@/lib/storefront-settings";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await getAdminDb().collection("settings").doc("storefront").get();
    const settings = snapshot.data();
    const savedPhone = settings?.whatsappPhone;
    const whatsappPhone = savedPhone === undefined
      ? DEFAULT_WHATSAPP_PHONE
      : normalizeWhatsAppPhone(savedPhone);
    let ceoProfile = { ...DEFAULT_CEO_PROFILE };
    let ceoProfileError = "";
    try {
      ceoProfile = normalizeCeoProfile(settings?.ceoProfile);
    } catch (error) {
      console.error("Saved CEO profile is invalid:", error);
      ceoProfileError = "The saved CEO profile is invalid.";
    }
    const announcement = settings?.announcement === undefined
      ? DEFAULT_ANNOUNCEMENT
      : normalizeAnnouncement(settings.announcement);
    const shopAddress = settings?.shopAddress === undefined
      ? DEFAULT_SHOP_ADDRESS
      : normalizeShopAddress(settings.shopAddress);

    if (!whatsappPhone) throw new Error("The saved WhatsApp number is invalid.");
    if (!announcement || !shopAddress) throw new Error("The saved announcement or shop address is invalid.");
    return NextResponse.json({ whatsappPhone, ceoProfile, ceoProfileError, announcement, shopAddress });
  } catch (error) {
    console.error("Could not load storefront settings:", error);
    return NextResponse.json({ error: "Storefront settings are unavailable." }, { status: 503 });
  }
}
