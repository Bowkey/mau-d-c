"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const STORAGE_KEY = "mau-Collections-cart";
const CartContext = createContext(null);
const SERVER_SNAPSHOT = { items: [], isReady: false };
let cartSnapshot = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set();

function isValidCartItem(item) {
  return item &&
    (typeof item.id === "string" || typeof item.id === "number") &&
    typeof item.title === "string" &&
    Number.isSafeInteger(item.price) &&
    item.price > 0 &&
    Number.isSafeInteger(item.quantity) &&
    item.quantity > 0 &&
    Array.isArray(item.images) &&
    item.images.every((image) => typeof image === "string");
}

function parseSavedItems(saved) {
  if (!saved) return [];
  const parsed = JSON.parse(saved);
  if (!Array.isArray(parsed)) throw new Error("Saved cart data is not a list.");
  const validItems = parsed.filter(isValidCartItem);
  if (validItems.length !== parsed.length) {
    console.error("Some invalid saved cart items were ignored.");
  }
  return validItems;
}

function initializeStore() {
  if (initialized || typeof window === "undefined") return;
  let items = [];
  try {
    items = parseSavedItems(window.localStorage.getItem(STORAGE_KEY));
  } catch (error) {
    console.error("Could not restore the saved cart:", error);
  }
  cartSnapshot = { items, isReady: true };
  initialized = true;
}

function getSnapshot() {
  return cartSnapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function replaceItems(items, persist = true) {
  initializeStore();
  cartSnapshot = { items, isReady: true };
  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Could not save the cart in this browser:", error);
    }
  }
  notifyListeners();
}

function handleStorage(event) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  let items = [];
  try {
    items = parseSavedItems(event.newValue);
  } catch (error) {
    console.error("Could not restore the cart updated in another tab:", error);
  }
  replaceItems(items, false);
}

function subscribe(listener) {
  listeners.add(listener);
  const previousSnapshot = cartSnapshot;
  initializeStore();
  if (cartSnapshot !== previousSnapshot) listener();
  if (typeof window !== "undefined") window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") window.removeEventListener("storage", handleStorage);
  };
}

function addItem(product) {
  initializeStore();
  const current = getSnapshot().items;
  const existing = current.find((item) => item.id === product.id);
  const items = existing
    ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    : [...current, { ...product, images: Array.isArray(product.images) ? product.images : [], quantity: 1 }];
  replaceItems(items);
}

function setItemQuantity(id, quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return;
  initializeStore();
  replaceItems(getSnapshot().items.map((item) => item.id === id ? { ...item, quantity } : item));
}

function removeItem(id) {
  initializeStore();
  replaceItems(getSnapshot().items.filter((item) => item.id !== id));
}

function clearCart() {
  replaceItems([]);
}

export function CartProvider({ children }) {
  const { items, isReady } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = {
    items,
    isReady,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    addItem,
    setItemQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider.");
  return cart;
}
