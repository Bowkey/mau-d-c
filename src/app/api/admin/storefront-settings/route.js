import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
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
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Sign in to manage storefront settings." }, { status: 401 });
    }

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
      ceoProfileError = "The saved CEO profile is invalid. Review the fields and save it again.";
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
    return NextResponse.json({ error: "Provide valid storefront settings." }, { status: 400 });
  }

  const updates = {};
  if (Object.hasOwn(body, "whatsappPhone")) {
    const whatsappPhone = normalizeWhatsAppPhone(body.whatsappPhone);
    if (!whatsappPhone) {
      return NextResponse.json({ error: "Enter a valid phone number with its country code (8–15 digits)." }, { status: 400 });
    }
    updates.whatsappPhone = whatsappPhone;
  }

  if (Object.hasOwn(body, "ceoProfile")) {
    let ceoProfile;
    try {
      ceoProfile = normalizeCeoProfile(body.ceoProfile);
    } catch {
      return NextResponse.json({ error: "Check the CEO name, description, and Cloudinary photo." }, { status: 400 });
    }
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (ceoProfile.image && (!cloudName || !ceoProfile.image.startsWith(`https://res.cloudinary.com/${cloudName}/image/upload/`))) {
      return NextResponse.json({ error: "The CEO photo must be uploaded to this shop's Cloudinary account." }, { status: 400 });
    }
    updates.ceoProfile = ceoProfile;
  }

  if (Object.hasOwn(body, "announcement")) {
    const announcement = normalizeAnnouncement(body.announcement);
    if (!announcement) {
      return NextResponse.json({ error: "Announcement must be between 1 and 200 characters." }, { status: 400 });
    }
    updates.announcement = announcement;
  }

  if (Object.hasOwn(body, "shopAddress")) {
    const shopAddress = normalizeShopAddress(body.shopAddress);
    if (!shopAddress) {
      return NextResponse.json({ error: "Shop address must be between 1 and 250 characters." }, { status: 400 });
    }
    updates.shopAddress = shopAddress;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Provide valid storefront settings." }, { status: 400 });
  }

  try {
    await getAdminDb().collection("settings").doc("storefront").set(updates, { merge: true });
    return NextResponse.json(updates);
  } catch (error) {
    console.error("Could not save storefront settings:", error);
    return NextResponse.json({ error: "Storefront settings could not be saved." }, { status: 503 });
  }
}
