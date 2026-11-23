"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { getCategoryLabel } from "@/lib/catalog";
import ImageLightbox from "@/components/image-lightbox";

function HeartIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" /></svg>;
}

export default function ProductCard({ product, onAddToBag }) {
  const images = Array.isArray(product.images) ? product.images : [];
  const [imageIndex, setImageIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const closeViewer = useCallback(() => setViewerOpen(false), []);

  function moveImage(direction) {
    setImageIndex((current) => (current + direction + images.length) % images.length);
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <button className="wish-button" aria-label={`Save ${product.title}`}><HeartIcon /></button>
        {images.length > 0
          ? <>
            <button className="image-view-button" type="button" onClick={() => setViewerOpen(true)} aria-label={`View ${product.title} image full screen`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
            </button>
            <Image src={images[imageIndex]} alt={`${product.title}, photo ${imageIndex + 1}`} width={900} height={1200} sizes="(max-width: 600px) 45vw, (max-width: 900px) 45vw, 30vw" />
          </>
          : <div className="product-image-placeholder" aria-label="No product photo"><span>MAU</span><small>Image coming soon</small></div>}
        {images.length > 1 && <>
          <button className="gallery-arrow gallery-previous" type="button" onClick={() => moveImage(-1)} aria-label="Previous product image">‹</button>
          <button className="gallery-arrow gallery-next" type="button" onClick={() => moveImage(1)} aria-label="Next product image">›</button>
          <span className="gallery-count">{imageIndex + 1} / {images.length}</span>
        </>}
        <button className="add-button" onClick={() => onAddToBag?.(product)}>Add to bag</button>
      </div>
      {viewerOpen && <ImageLightbox images={images} title={product.title} initialIndex={imageIndex} onClose={closeViewer} />}
      <div className="product-info">
        <div><h3>{product.title}</h3><p>{getCategoryLabel(product.category)}</p></div>
        <p className="price">₦{product.price.toLocaleString("en-NG")}</p>
        <p className="product-description">{product.description}</p>
      </div>
    </article>
  );
}
