"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function getDownloadUrl(url) {
  return url.replace("/image/upload/", "/image/upload/fl_attachment/");
}

export default function ImageLightbox({ images, title, initialIndex = 0, onClose }) {
  const [imageIndex, setImageIndex] = useState(initialIndex);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setImageIndex((current) => (current - 1 + images.length) % images.length);
      }
      if (event.key === "ArrowRight") {
        setImageIndex((current) => (current + 1) % images.length);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [images.length, onClose]);

  if (typeof document === "undefined") return null;

  const currentImage = images[imageIndex];
  return createPortal(
    <div className="image-lightbox">
      <button className="image-lightbox-backdrop" type="button" onClick={onClose} aria-label="Close image viewer" />
      <section className="image-lightbox-dialog" role="dialog" aria-modal="true" aria-label={`${title} image viewer`}>
        <button className="image-lightbox-close" type="button" onClick={onClose} aria-label="Close image viewer">×</button>
        <div className="image-lightbox-stage">
          <Image src={currentImage} alt={title} fill priority sizes="100vw" className="image-lightbox-photo" />
          {images.length > 1 && <>
            <button className="image-lightbox-arrow image-lightbox-previous" type="button" onClick={() => setImageIndex((current) => (current - 1 + images.length) % images.length)} aria-label="Previous image">‹</button>
            <button className="image-lightbox-arrow image-lightbox-next" type="button" onClick={() => setImageIndex((current) => (current + 1) % images.length)} aria-label="Next image">›</button>
          </>}
        </div>
        <div className="image-lightbox-toolbar">
          <span>{title}{images.length > 1 ? ` · ${imageIndex + 1} of ${images.length}` : ""}</span>
          <a href={getDownloadUrl(currentImage)} download>Download image</a>
        </div>
      </section>
    </div>,
    document.body
  );
}
