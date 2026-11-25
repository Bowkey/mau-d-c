"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DEFAULT_CATEGORY_VISIBILITY } from "@/lib/catalog";
import { useCart } from "@/components/cart-provider";
import ImageLightbox from "@/components/image-lightbox";
import StorefrontFooter from "@/components/storefront-footer";
import StorefrontHeader from "@/components/storefront-header";
import { DEFAULT_WHATSAPP_PHONE } from "@/lib/storefront-settings";

function formatPrice(price) {
  return `₦${price.toLocaleString("en-NG")}`;
}

export default function CartPage() {
  const { items, isReady, itemCount, setItemQuantity, removeItem } = useCart();
  const [categoryAvailability, setCategoryAvailability] = useState(DEFAULT_CATEGORY_VISIBILITY);
  const [whatsappPhone, setWhatsappPhone] = useState(DEFAULT_WHATSAPP_PHONE);
  const [copyStatus, setCopyStatus] = useState("");
  const [viewingImage, setViewingImage] = useState(null);
  const closeImageViewer = useCallback(() => setViewingImage(null), []);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderMessage = [
    "Hello Mau Designs & Collections! I'd like to order:",
    ...items.map((item, index) =>
      `${index + 1}. ${item.title} × ${item.quantity} — ${formatPrice(item.price)} each (${formatPrice(item.price * item.quantity)})`
    ),
    `Total: ${formatPrice(total)}`,
  ].join("\n");

  useEffect(() => {
    fetch("/api/categories")
      .then(async (response) => {
        if (!response.ok) throw new Error("Shop sections could not be loaded.");
        const data = await response.json();
        setCategoryAvailability(data.availability);
      })
      .catch((error) => console.error("Could not load cart navigation sections:", error));

    fetch("/api/storefront-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("The WhatsApp contact number could not be loaded.");
        return response.json();
      })
      .then((settings) => setWhatsappPhone(settings.whatsappPhone))
      .catch((error) => {
        console.error("Could not load the WhatsApp number for the cart:", error);
        setCopyStatus("The saved WhatsApp number could not be loaded; the default contact will be used.");
      });
  }, []);

  async function copyOrder() {
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopyStatus("Order details copied. Paste them into your WhatsApp message.");
    } catch (error) {
      console.error("Could not copy the cart order:", error);
      setCopyStatus("Could not copy automatically. Use the WhatsApp button to send your order.");
    }
  }

  return (
    <main className="cart-page">
      <StorefrontHeader categoryAvailability={categoryAvailability} />
      <section className="cart-content">
        <div className="cart-title">
          <div><p className="eyebrow">YOUR MAU SELECTION</p><h1>Your cart</h1></div>
          <div className="cart-title-actions">
            <p>{itemCount} {itemCount === 1 ? "item" : "items"}</p>
            <Link className="cart-close" href="/" aria-label="Close cart and return to shop">×</Link>
          </div>
        </div>

        {!isReady
          ? <p className="shop-message">Restoring your saved cart…</p>
          : items.length === 0
            ? <div className="cart-empty">
              <p>Your cart is waiting for something lovely.</p>
              <Link className="primary-button" href="/">Continue shopping</Link>
            </div>
            : <div className="cart-layout">
              <div className="cart-items">
                {items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    {item.images[0]
                      ? <button className="cart-item-image-button" type="button" onClick={() => setViewingImage(item)} aria-label={`View ${item.title} image full screen`}>
                        <Image src={item.images[0]} alt={item.title} width={150} height={190} sizes="110px" />
                      </button>
                      : <div className="cart-item-image-placeholder" aria-label="No product photo">MAU</div>}
                    <div className="cart-item-details">
                      <div className="cart-item-heading">
                        <div><h2>{item.title}</h2><p>{formatPrice(item.price)} each</p></div>
                        <button className="cart-remove" type="button" onClick={() => removeItem(item.id)}>Remove</button>
                      </div>
                      <div className="cart-item-bottom">
                        <div className="quantity-control" aria-label={`Quantity for ${item.title}`}>
                          <button type="button" onClick={() => setItemQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Decrease ${item.title} quantity`}>−</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => setItemQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.title} quantity`}>+</button>
                        </div>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <aside className="cart-summary">
                <h2>Order summary</h2>
                <div><span>Items</span><span>{itemCount}</span></div>
                <div className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></div>
                <p>Send this list to Mau on WhatsApp to confirm availability and delivery.</p>
                <button className="admin-primary cart-copy-button" type="button" onClick={copyOrder}>Copy all cart items</button>
                <a className="cart-whatsapp-button" href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(orderMessage)}`} target="_blank" rel="noopener noreferrer">Send order on WhatsApp</a>
                {copyStatus && <p className="cart-copy-status" role="status">{copyStatus}</p>}
              </aside>
            </div>}
      </section>
      <StorefrontFooter />
      {viewingImage && <ImageLightbox images={viewingImage.images} title={viewingImage.title} onClose={closeImageViewer} />}
    </main>
  );
}
