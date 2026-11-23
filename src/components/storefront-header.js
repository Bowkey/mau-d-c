"use client";
import HeaderLogo from "./HeaderIcon.js";
import Link from "next/link";
import { useState } from "react";
import { NAV_SECTIONS } from "@/lib/catalog";
import { useCart } from "@/components/cart-provider";

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

export default function StorefrontHeader({ categoryAvailability, onSelectCategory }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const visibleNavSections = NAV_SECTIONS.filter((section) =>
    categoryAvailability[section.id] &&
    (!section.children || section.children.some((service) => categoryAvailability[service.id]))
  );

  return (
    <>
      <div className="announcement">A little color, a lot of craft — made and found at Mau</div>
      <header className="header">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu"><HeaderIcon name={menuOpen ? "close" : "menu"} /></button>
        <Link className="brand" href="/">
        <HeaderLogo />
        {/* MAU<span>DESIGNS</span> */}
        
        </Link>
        <nav className={menuOpen ? "nav nav-open" : "nav"} aria-label="Main navigation">
          {visibleNavSections.map((section) => section.children ? (
            <div className="nav-service-group" key={section.id}>
              <Link href="/services" onClick={() => setMenuOpen(false)}>{section.label}</Link>
              <details className="nav-dropdown">
                <summary aria-label="Choose a service"><span aria-hidden="true">⌄</span></summary>
                <div className="nav-dropdown-menu">
                  {section.children.filter((service) => categoryAvailability[service.id]).map((service) => (
                    <Link href={`/services?type=${service.id}`} key={service.id} onClick={() => setMenuOpen(false)}>{service.label}</Link>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <Link
              href={
                section.id === "styles"
                  ? "/styles"
                  : section.id === "sewing-materials"
                    ? "/sewing-materials"
                    : `/?category=${section.id}#shop`
              }
              key={section.id}
              onClick={(event) => {
                if (onSelectCategory && !["styles", "sewing-materials"].includes(section.id)) {
                  event.preventDefault();
                  onSelectCategory(section.id);
                }
                setMenuOpen(false);
              }}
            >
              {section.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Search"><HeaderIcon name="search" /></button>
          <button className="icon-button desktop-action" aria-label="Account"><HeaderIcon name="user" /></button>
          <Link className="icon-button bag-button" href="/cart" aria-label={`View cart with ${itemCount} items`}>
            <HeaderIcon name="bag" />{itemCount > 0 && <span className="cart-count">{itemCount}</span>}
          </Link>
        </div>
      </header>
    </>
  );
}
