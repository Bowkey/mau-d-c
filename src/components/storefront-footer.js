"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DEFAULT_SHOP_ADDRESS } from "@/lib/storefront-settings";

export default function StorefrontFooter() {
  const [shopAddress, setShopAddress] = useState(DEFAULT_SHOP_ADDRESS);

  useEffect(() => {
    let active = true;
    fetch("/api/storefront-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Shop address could not be loaded.");
        return response.json();
      })
      .then((settings) => {
        if (active) setShopAddress(settings.shopAddress);
      })
      .catch((error) => console.error("Could not load shop address:", error));

    return () => { active = false; };
  }, []);

  return (
    <footer id="footer">
      <Link className="brand footer-brand" href="/">MAU<span>DESIGNS</span></Link>
      <div className="footer-info">
        <p>Colorful fabrics, thoughtful making, and style with heart.</p>
        <address className="footer-address"><strong>Visit us</strong><span>{shopAddress}</span></address>
      </div>
      <div className="footer-links"><a href="#">Instagram</a><a href="#">WhatsApp</a><a href="#">Contact</a><Link href="/admin">Admin</Link></div>
    </footer>
  );
}
