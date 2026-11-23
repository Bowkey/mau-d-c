"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ProductCard from "@/components/product-card";
import StorefrontFooter from "@/components/storefront-footer";
import StorefrontHeader from "@/components/storefront-header";
import Logo1 from "@/components/logo1";
import { useCart } from "@/components/cart-provider";
import {
  DEFAULT_CATEGORY_VISIBILITY,
  isCategoryAvailable,
  NAV_SECTIONS,
  PRODUCT_CATEGORIES,
} from "@/lib/catalog";

const categoryArtwork = {
  styles: ["Made-to-measure pieces", "https://images.unsplash.com/flagged/photo-1578905326519-3aa98aa6a728?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
  "sewing-materials": ["Tools for every project", "https://images.unsplash.com/photo-1578353022142-09264fd64295?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"],
  fabrics: ["Color, texture, possibility", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7aaqXeTovNfnjJ-suFsl31v4IgoDkEbEX09L8Y10sQ&s"],
  "sewing-accessories": ["Finishing touches", "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=82"],
  "sewing-machine-parts": ["Keep your machine moving", "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=700&q=82"],
};

function Icon({ name, size = 20 }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5a5.5 5.5 0 0 0 1-8.9Z" />,
    bag: <><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [categoryAvailability, setCategoryAvailability] = useState(DEFAULT_CATEGORY_VISIBILITY);
  const [categoriesError, setCategoriesError] = useState(false);
  const [category, setCategory] = useState("All");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const visibleProducts = category === "All"
    ? products
    : products.filter((product) => product.category === category);
  const visibleNavSections = NAV_SECTIONS.filter((section) =>
    categoryAvailability[section.id] &&
    (!section.children || section.children.some((service) => categoryAvailability[service.id]))
  );
  const visibleCategoryFilters = PRODUCT_CATEGORIES.filter((item) =>
    isCategoryAvailable(item.id, categoryAvailability)
  );

  useEffect(() => {
    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Products could not be loaded.");
        const data = await response.json();
        setProducts(data.products);
      })
      .catch(() => setProductsError(true))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then(async (response) => {
        if (!response.ok) throw new Error("Shop sections could not be loaded.");
        const data = await response.json();
        setCategoryAvailability(data.availability);
        const requestedCategory = new URLSearchParams(window.location.search).get("category");
        if (
          PRODUCT_CATEGORIES.some((item) => item.id === requestedCategory) &&
          isCategoryAvailable(requestedCategory, data.availability)
        ) {
          setCategory(requestedCategory);
        }
      })
      .catch(() => setCategoriesError(true));
  }, []);

  function selectCategory(id) {
    setCategory(id);
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
  }

  function subscribe(event) {
    event.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  }

  return (
    <main>
      <StorefrontHeader categoryAvailability={categoryAvailability} onSelectCategory={selectCategory} />

      <section className="hero">
        <Logo1 />
        <div className="hero-content">
          <p className="eyebrow">FABRIC, FINESSE & A LITTLE JOY</p>
          <h1>Make room<br />for <em>color.</em></h1>
          <p className="hero-copy">Sewn-with-love styles, beautiful fabrics, and all the little things that bring your next idea to life.</p>
          <a className="primary-button" href="#shop">Explore the shop <Icon name="arrow" /></a>
        </div>
      </section>

      <section className="category-strip" aria-label="Shop categories">
        {visibleNavSections.filter((section) => !section.children).slice(0, 3).map((section) => (
          <button className="category-card" key={section.id} onClick={() => selectCategory(section.id)}>
            <Image src={categoryArtwork[section.id][1]} alt="" width={700} height={850} sizes="(max-width: 900px) 92px, 116px" />
            <span><b>{section.label}</b><small>{categoryArtwork[section.id][0]}</small></span>
            <span className="category-arrow"><Icon name="arrow" size={18} /></span>
          </button>
        ))}
      </section>

      <section className="shop-section" id="shop">
        <div className="section-heading">
          <div><p className="eyebrow">CURATED FOR YOU</p><h2>Most loved</h2></div>
          <div className="filters" aria-label="Filter products">
            <button className={category === "All" ? "active" : ""} onClick={() => setCategory("All")}>All</button>
            {visibleCategoryFilters.map((item) => <button key={item.id} className={category === item.id ? "active" : ""} onClick={() => setCategory(item.id)}>{item.label}</button>)}
          </div>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} onAddToBag={addItem} />)}
        </div>
        {!productsLoading && productsError && <p className="shop-message" role="status">Products are temporarily unavailable. Please try again later.</p>}
        {categoriesError && <p className="shop-message" role="status">Shop sections could not be refreshed; showing the default sections.</p>}
        {!productsLoading && !productsError && visibleProducts.length === 0 && <p className="shop-message">No products in this collection just yet. Check back soon.</p>}
        {productsLoading && <p className="shop-message">Loading the latest designs…</p>}
      </section>

      <section className="story" id="story">
        <div className="story-image"><Image src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85" alt="Designer working in a fashion studio" width={1000} height={1000} sizes="(max-width: 900px) 100vw, 50vw" /></div>
        <div className="story-copy">
          <p className="eyebrow">OUR STORY</p><h2>Designed with heart,<br /><em>made with purpose.</em></h2>
          <p>Mau Designs began with a simple belief: every woman deserves to feel seen, celebrated, and completely herself. From the first sketch to the final stitch, each piece is created with care and intention.</p>
          <a className="text-link" href="#footer">Discover our story <Icon name="arrow" /></a>
        </div>
      </section>

      <section className="newsletter">
        <div><p className="eyebrow">STAY IN THE KNOW</p><h2>Notes from the atelier</h2></div>
        <form onSubmit={subscribe}>
          {subscribed ? <p className="success">Thank you — you&apos;re on the list.</p> : <><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" required aria-label="Email address" /><button type="submit" aria-label="Subscribe"><Icon name="arrow" /></button></>}
        </form>
      </section>
      <StorefrontFooter />
    </main>
  );
}
