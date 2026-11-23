"use client";

import Image from "next/image";
import { useState } from "react";
import { getCategoryLabel } from "@/lib/catalog";

function HeartIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" /></svg>;
}

export default function ProductCard({ product, onAddToBag }) {
  const [imageIndex, setImageIndex] = useState(0);

  function moveImage(direction) {
    setImageIndex((current) => (current + direction + product.images.length) % product.images.length);
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <button className="wish-button" aria-label={`Save ${product.title}`}><HeartIcon /></button>
        <Image src={product.images[imageIndex]} alt={`${product.title}, photo ${imageIndex + 1}`} width={900} height={1200} sizes="(max-width: 600px) 45vw, (max-width: 900px) 45vw, 30vw" />
        {product.images.length > 1 && <>
          <button className="gallery-arrow gallery-previous" type="button" onClick={() => moveImage(-1)} aria-label="Previous product image">‹</button>
          <button className="gallery-arrow gallery-next" type="button" onClick={() => moveImage(1)} aria-label="Next product image">›</button>
          <span className="gallery-count">{imageIndex + 1} / {product.images.length}</span>
        </>}
        <button className="add-button" onClick={() => onAddToBag?.(product)}>Add to bag</button>
      </div>
      <div className="product-info">
        <div><h3>{product.title}</h3><p>{getCategoryLabel(product.category)}</p></div>
        <p className="price">₦{product.price.toLocaleString("en-NG")}</p>
        <p className="product-description">{product.description}</p>
      </div>
    </article>
  );
}
