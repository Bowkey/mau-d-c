"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CATEGORY_VISIBILITY,
  isCategoryAvailable,
  NAV_SECTIONS,
  PRODUCT_CATEGORIES,
} from "@/lib/catalog";
import ProductCard from "@/components/product-card";
import StorefrontFooter from "@/components/storefront-footer";
import StorefrontHeader from "@/components/storefront-header";
import { useCart } from "@/components/cart-provider";

export default function CatalogPage({ kind, categoryId, initialService = "All" }) {
  const listingCategoryId = kind === "sewing-materials" ? "sewing-materials" : categoryId;
  const [products, setProducts] = useState([]);
  const [availability, setAvailability] = useState(DEFAULT_CATEGORY_VISIBILITY);
  const [selectedService, setSelectedService] = useState(initialService);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/products").then(async (response) => {
        if (!response.ok) throw new Error("Products could not be loaded.");
        return response.json();
      }),
      fetch("/api/categories").then(async (response) => {
        if (!response.ok) throw new Error("Shop sections could not be loaded.");
        return response.json();
      }),
    ])
      .then(([productData, categoryData]) => {
        if (!active) return;
        setProducts(productData.products);
        setAvailability(categoryData.availability);
        setSelectedService(
          initialService !== "All" && isCategoryAvailable(initialService, categoryData.availability)
            ? initialService
            : "All"
        );
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [initialService]);

  const isAvailable = kind === "styles"
    ? availability.styles
    : kind === "services"
      ? availability.services && PRODUCT_CATEGORIES.some(({ id }) =>
        id.startsWith("service-") && isCategoryAvailable(id, availability)
      )
      : availability[listingCategoryId];
  const serviceFilters = PRODUCT_CATEGORIES.filter(({ id }) =>
    id.startsWith("service-") && isCategoryAvailable(id, availability)
  );
  const sectionProducts = useMemo(() => products.filter((product) =>
    kind === "styles"
      ? product.category === "styles"
      : kind === "services"
        ? product.category.startsWith("service-")
        : product.category === listingCategoryId
  ), [kind, listingCategoryId, products]);
  const visibleProducts = kind !== "services" || selectedService === "All"
    ? sectionProducts
    : sectionProducts.filter((product) => product.category === selectedService);

  const { addItem } = useCart();

  const categorySection = NAV_SECTIONS.find((section) => section.id === listingCategoryId);
  const title = kind === "styles" ? "Styles" : kind === "services" ? "Services" : categorySection?.label || "Shop";
  const description = kind === "styles"
    ? "Every sewn design, made with care and a little color."
    : kind === "services"
      ? "Sewing, amendments, training and weaving — find the service you need."
      : categorySection?.description || "Explore this part of the Mau shop.";
  const heading = kind === "styles"
    ? "All sewn designs"
    : kind === "services"
      ? "How can we help?"
      : `Shop ${title.toLowerCase()}`;
    
  
  return (
    <main className="catalog-page">
      <StorefrontHeader categoryAvailability={availability} />
      <section className="catalog-hero">
        <p className="eyebrow">MAU DESIGNS & COLLECTIONS</p>
        <h1>{title}<span>.</span></h1>
        <p>{description}</p>
      </section>
      <section className="shop-section catalog-shop">
        <div className="section-heading">
          <div><p className="eyebrow">{kind === "styles" ? "MADE TO BE WORN" : kind === "services" ? "MADE TO HELP YOU CREATE" : "FIND YOUR NEXT PROJECT"}</p><h2>{heading}</h2></div>
          {kind === "services" && <div className="filters" aria-label="Filter services">
            <button className={selectedService === "All" ? "active" : ""} onClick={() => setSelectedService("All")}>All services</button>
            {serviceFilters.map((service) => <button key={service.id} className={selectedService === service.id ? "active" : ""} onClick={() => setSelectedService(service.id)}>{service.label}</button>)}
          </div>}
        </div>
        {!isAvailable
          ? <p className="shop-message">This section is currently unavailable. Please check back soon.</p>
          : error
            ? <p className="shop-message" role="alert">{error}</p>
            : loading
              ? <p className="shop-message">Loading the latest from Mau…</p>
              : visibleProducts.length === 0
                ? <p className="shop-message">Nothing here just yet. Check back soon.</p>
                : <div className="product-grid">
                  {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAddToBag={addItem} />)}
                </div>}
      </section>
      <StorefrontFooter />
    </main>
  );
}
