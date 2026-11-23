"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_WHATSAPP_PHONE } from "@/lib/storefront-settings";

export default function Wawidget() {
  const pathname = usePathname();
  const [phone, setPhone] = useState(DEFAULT_WHATSAPP_PHONE);

  useEffect(() => {
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;

    fetch("/api/storefront-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load the WhatsApp contact number.");
        return response.json();
      })
      .then((settings) => setPhone(settings.whatsappPhone))
      .catch((error) => console.error("Could not update the WhatsApp widget:", error));
  }, [pathname]);

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return null;

  return (
    <a
      className="whatsapp-widget"
      href={`https://wa.me/${phone}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mau Designs & Collections on WhatsApp"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.83 11.83 0 0 0 12.1 0C5.55 0 .22 5.32.22 11.87c0 2.09.55 4.13 1.59 5.93L.12 24l6.36-1.67a11.9 11.9 0 0 0 5.62 1.43h.01c6.54 0 11.87-5.32 11.87-11.87 0-3.17-1.23-6.15-3.46-8.41Zm-8.41 18.27h-.01a9.9 9.9 0 0 1-5.04-1.37l-.36-.21-3.77.99 1.01-3.67-.24-.38a9.86 9.86 0 0 1-1.51-5.24C2.2 6.42 6.64 1.98 12.1 1.98c2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 7c0 5.46-4.44 9.87-9.87 9.87Zm5.42-7.4c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.78.97-.95 1.17-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.68-1.62-.93-2.22-.25-.58-.5-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.23 5.14 4.53.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.77-.73 2.02-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
      </svg>
      <span>Chat on WhatsApp</span>
    </a>
  );
}
