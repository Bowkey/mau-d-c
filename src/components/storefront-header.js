"use client";
import HeaderLogo from "./HeaderIcon.js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ROUTES, getCategoryLabel, NAV_SECTIONS } from "@/lib/catalog";
import { useCart } from "@/components/cart-provider";
import { DEFAULT_ANNOUNCEMENT } from "@/lib/storefront-settings";

function HeaderIcon({ name }) {
  const paths = {
    search: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    bag: <><path d="M6 8h12l1 13H5L6 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function StorefrontHeader({ categoryAvailability }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProducts, setSearchProducts] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoaded, setSearchLoaded] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchNotice, setSearchNotice] = useState("");
  const { itemCount, addItem } = useCart();
  const visibleNavSections = NAV_SECTIONS.filter((section) =>
    categoryAvailability[section.id] &&
    (!section.children || section.children.some((service) => categoryAvailability[service.id]))
  );
  const matchingProducts = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    if (!query) return [];
    return searchProducts.filter((product) =>
      product.title.toLocaleLowerCase().includes(query) ||
      (product.description || "").toLocaleLowerCase().includes(query)
    );
  }, [searchProducts, searchQuery]);

  useEffect(() => {
    let active = true;
    fetch("/api/storefront-settings")
      .then(async (response) => {
        if (!response.ok) throw new Error("Storefront announcement could not be loaded.");
        return response.json();
      })
      .then((settings) => {
        if (active) setAnnouncement(settings.announcement);
      })
      .catch((error) => console.error("Could not load storefront announcement:", error));

    return () => { active = false; };
  }, []);

  async function loadSearchProducts() {
    setSearchLoading(true);
    setSearchError("");
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Products could not be loaded.");
      const data = await response.json();
      if (!Array.isArray(data.products)) throw new Error("The product list is invalid.");
      setSearchProducts(data.products);
      setSearchLoaded(true);
    } catch (error) {
      console.error("Could not load products for search:", error);
      setSearchError("Search is temporarily unavailable. Please try again.");
    } finally {
      setSearchLoading(false);
    }
  }

  function toggleSearch() {
    if (searchOpen) {
      setSearchOpen(false);
      setSearchQuery("");
      setSearchNotice("");
      return;
    }
    setMenuOpen(false);
    setSearchOpen(true);
    setSearchNotice("");
    if (!searchLoaded && !searchLoading) loadSearchProducts();
  }

  function addSearchResult(product) {
    addItem(product);
    setSearchNotice(`${product.title} added to your cart.`);
  }

  return (
    <>
      <div className="announcement">{announcement}</div>
      <header className="header sticky top">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><HeaderIcon name={menuOpen ? "close" : "menu"} /></button>
        <Link className="brand" href="/">
        <HeaderLogo />
        {/* MAU<span>DESIGNS</span> */}
        
        </Link>
        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Main navigation">
          {visibleNavSections.map((section) => section.children ? (
            <Link href="/services" key={section.id} onClick={() => setMenuOpen(false)}>{section.label}</Link>
          ) : (
            <Link
              href={CATEGORY_ROUTES[section.id] || `/?category=${section.id}#shop`}
              key={section.id}
              onClick={() => setMenuOpen(false)}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" type="button" onClick={toggleSearch} aria-label={searchOpen ? "Close search" : "Search"} aria-expanded={searchOpen} aria-controls="storefront-search-panel">
            <HeaderIcon name={searchOpen ? "close" : "search"} />
          </button>
          <button className="icon-button desktop-action" aria-label="Account"><HeaderIcon name="user" /></button>
          <Link className="icon-button bag-button" href="/cart" aria-label={`View cart with ${itemCount} items`}>
            <HeaderIcon name="bag" />{itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
        </div>
        {searchOpen && <section className="search-panel" id="storefront-search-panel" role="search" aria-label="Search the shop">
          <label htmlFor="storefront-search-input">Search products</label>
          <input
            id="storefront-search-input"
            type="search"
            list="storefront-search-items"
            autoComplete="off"
            autoFocus
            placeholder="Type an item name…"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setSearchNotice("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") toggleSearch();
            }}
          />
          <datalist id="storefront-search-items">
            {searchProducts.map((product) => <option key={product.id} value={product.title} />)}
          </datalist>
          {searchLoading && <p className="search-feedback">Loading available products…</p>}
          {searchError && <p className="search-feedback form-error" role="alert">{searchError}</p>}
          {!searchLoading && !searchError && searchQuery.trim() && matchingProducts.length === 0 && <p className="search-feedback">No matching products found.</p>}
          {matchingProducts.length > 0 && <div className="search-results" role="list" aria-label="Matching products">
            {matchingProducts.map((product) => (
              <div className="search-result" key={product.id} role="listitem">
                <div><strong>{product.title}</strong><span>{getCategoryLabel(product.category)} · ₦{product.price.toLocaleString("en-NG")}</span></div>
                <button type="button" onClick={() => addSearchResult(product)}>Add</button>
              </div>
            ))}
          </div>}
          {searchNotice && <p className="search-feedback form-success" role="status">{searchNotice}</p>}
        </section>}
      </header>
    </>
  );
}
