"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_CATEGORY_VISIBILITY,
  isCategoryAvailable,
  NAV_SECTIONS,
  PRODUCT_CATEGORIES,
} from "@/lib/catalog";
import { DEFAULT_CEO_PROFILE, DEFAULT_WHATSAPP_PHONE } from "@/lib/storefront-settings";
import HeaderLogo from "./HeaderIcon";

async function responseError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  return body.error || fallback;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [editingProductId, setEditingProductId] = useState("");
  const [form, setForm] = useState({ title: "", description: "", price: "", category: "styles", isPublished: true });
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [inventoryNotice, setInventoryNotice] = useState("");
  const [categoryAvailability, setCategoryAvailability] = useState(DEFAULT_CATEGORY_VISIBILITY);
  const [updatingCategory, setUpdatingCategory] = useState("");
  const [categorySettingsError, setCategorySettingsError] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState(`+${DEFAULT_WHATSAPP_PHONE}`);
  const [savingWhatsappPhone, setSavingWhatsappPhone] = useState(false);
  const [whatsappSettingsError, setWhatsappSettingsError] = useState("");
  const [whatsappSettingsNotice, setWhatsappSettingsNotice] = useState("");
  const [ceoProfile, setCeoProfile] = useState(DEFAULT_CEO_PROFILE);
  const [ceoImageFile, setCeoImageFile] = useState(null);
  const [ceoImagePreview, setCeoImagePreview] = useState("");
  const [savingCeoProfile, setSavingCeoProfile] = useState(false);
  const [ceoSettingsError, setCeoSettingsError] = useState("");
  const [ceoSettingsNotice, setCeoSettingsNotice] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const previewUrls = useRef(new Set());
  const ceoPreviewUrl = useRef("");

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    if (ceoPreviewUrl.current) URL.revokeObjectURL(ceoPreviewUrl.current);
  }, []);

  async function loadProducts() {
    setLoadingProducts(true);
    try {
      const response = await fetch("/api/admin/products");
      if (!response.ok) throw new Error(await responseError(response, "Products could not be loaded."));
      const data = await response.json();
      setProducts(data.products);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function loadCategoryAvailability() {
    setCategorySettingsError("");
    try {
      const response = await fetch("/api/admin/categories");
      if (!response.ok) throw new Error(await responseError(response, "Category settings could not be loaded."));
      const data = await response.json();
      setCategoryAvailability(data.availability);
    } catch (settingsError) {
      setCategorySettingsError(settingsError.message);
    }
  }

  async function loadStorefrontSettings() {
    setWhatsappSettingsError("");
    try {
      const response = await fetch("/api/admin/storefront-settings");
      if (!response.ok) throw new Error(await responseError(response, "Storefront settings could not be loaded."));
      const data = await response.json();
      setWhatsappPhone(`+${data.whatsappPhone}`);
      setCeoProfile(data.ceoProfile);
      setCeoSettingsError(data.ceoProfileError || "");
    } catch (settingsError) {
      setWhatsappSettingsError(settingsError.message);
      setCeoSettingsError(settingsError.message);
    }
  }

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session")
      .then(async (response) => {
        if (!response.ok) throw new Error(await responseError(response, "Admin login is not configured."));
        return response.json();
      })
      .then((data) => {
        if (active && data.authenticated) {
          setAuthenticated(true);
          loadProducts();
          loadCategoryAvailability();
          loadStorefrontSettings();
        }
      })
      .catch((sessionError) => {
        if (active) setError(sessionError.message);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });
    return () => { active = false; };
  }, []);

  async function login(event) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Could not sign in."));
      setPassword("");
      setAuthenticated(true);
      await Promise.all([loadProducts(), loadCategoryAvailability(), loadStorefrontSettings()]);
    } catch (loginError) {
      setError(loginError.message);
    }
  }

  function chooseFiles(event) {
    const selected = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length + existingImages.length + selected.length > 5) {
      setError("A product can have up to 5 images.");
      return;
    }
    const invalidFile = selected.find((file) => !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024);
    if (invalidFile) {
      setError("Choose JPG, PNG, WebP, or AVIF images under 10 MB each.");
      return;
    }
    setError("");
    setFiles((current) => [...current, ...selected.map((file) => {
      const url = URL.createObjectURL(file);
      previewUrls.current.add(url);
      return { file, url };
    })]);
  }

  function clearProductForm() {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
    setFiles([]);
    setExistingImages([]);
    setEditingProductId("");
    setForm({ title: "", description: "", price: "", category: "styles", isPublished: true });
  }

  function startEditing(product) {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
    setFiles([]);
    setEditingProductId(product.id);
    setExistingImages(Array.isArray(product.images) ? product.images : []);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      category: product.category,
      isPublished: product.isPublished,
    });
    setError("");
    setNotice("");
    document.getElementById("product-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeExistingImage(index) {
    setExistingImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  }

  async function uploadImageFiles(selectedFiles, purpose) {
    const signatureResponse = await fetch("/api/admin/cloudinary-signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: selectedFiles.length, purpose }),
    });
    if (!signatureResponse.ok) throw new Error(await responseError(signatureResponse, "Could not prepare image upload."));
    const { cloudName, apiKey, signatures } = await signatureResponse.json();
    return Promise.all(selectedFiles.map(async (file, index) => {
      const signature = signatures[index];
      const data = new FormData();
      data.append("file", file);
      data.append("api_key", apiKey);
      data.append("timestamp", String(signature.timestamp));
      data.append("folder", signature.folder);
      data.append("public_id", signature.public_id);
      data.append("allowed_formats", signature.allowed_formats);
      data.append("overwrite", String(signature.overwrite));
      data.append("signature", signature.signature);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || "An image could not be uploaded.");
      return result.secure_url;
    }));
  }

  async function uploadImages() {
    return uploadImageFiles(files.map(({ file }) => file), "products");
  }

  function chooseCeoImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setCeoSettingsError("Choose a JPG, PNG, WebP, or AVIF image under 10 MB.");
      return;
    }

    if (ceoPreviewUrl.current) URL.revokeObjectURL(ceoPreviewUrl.current);
    const preview = URL.createObjectURL(file);
    ceoPreviewUrl.current = preview;
    setCeoImageFile(file);
    setCeoImagePreview(preview);
    setCeoSettingsError("");
    setCeoSettingsNotice("");
  }

  function removeCeoImage() {
    if (ceoPreviewUrl.current) URL.revokeObjectURL(ceoPreviewUrl.current);
    ceoPreviewUrl.current = "";
    setCeoImageFile(null);
    setCeoImagePreview("");
    setCeoProfile((current) => ({ ...current, image: "" }));
  }

  async function saveCeoProfile(event) {
    event.preventDefault();
    setSavingCeoProfile(true);
    setCeoSettingsError("");
    setCeoSettingsNotice("");
    try {
      const image = ceoImageFile
        ? (await uploadImageFiles([ceoImageFile], "ceo"))[0]
        : ceoProfile.image;
      const response = await fetch("/api/admin/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ceoProfile: { ...ceoProfile, image } }),
      });
      if (!response.ok) throw new Error(await responseError(response, "The CEO profile could not be saved."));
      const data = await response.json();
      setCeoProfile(data.ceoProfile);
      if (ceoPreviewUrl.current) URL.revokeObjectURL(ceoPreviewUrl.current);
      ceoPreviewUrl.current = "";
      setCeoImageFile(null);
      setCeoImagePreview("");
      setCeoSettingsNotice("CEO profile updated.");
    } catch (settingsError) {
      setCeoSettingsError(settingsError.message);
    } finally {
      setSavingCeoProfile(false);
    }
  }

  async function saveProduct(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    const imageCount = existingImages.length + files.length;
    if (imageCount > 5) {
      setError("A product can have up to 5 images.");
      return;
    }

    setSubmitting(true);
    try {
      const uploadedImages = files.length > 0 ? await uploadImages() : [];
      const images = [...existingImages, ...uploadedImages];
      const isEditing = Boolean(editingProductId);
      const response = await fetch(isEditing ? `/api/admin/products/${editingProductId}` : "/api/admin/products", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price), images }),
      });
      if (!response.ok) throw new Error(await responseError(response, "The product could not be saved."));
      clearProductForm();
      setNotice(isEditing ? "Product updated." : form.isPublished ? "Product created and published." : "Product saved as a draft.");
      await loadProducts();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function cancelEditing() {
    clearProductForm();
    setError("");
    setNotice("");
  }

  async function deleteProduct(product) {
    const confirmed = window.confirm(`Delete "${product.title}"? This will remove it from your inventory and the storefront.`);
    if (!confirmed) return;

    setUpdatingId(product.id);
    setInventoryError("");
    setInventoryNotice("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await responseError(response, "The product could not be deleted."));
      setProducts((current) => current.filter((item) => item.id !== product.id));
      if (editingProductId === product.id) clearProductForm();
      setInventoryNotice("Product deleted.");
    } catch (deleteError) {
      setInventoryError(deleteError.message);
    } finally {
      setUpdatingId("");
    }
  }

  async function togglePublication(product) {
    setUpdatingId(product.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !product.isPublished }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Publication status could not be updated."));
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, isPublished: !item.isPublished } : item));
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setUpdatingId("");
    }
  }

  async function toggleCategory(id) {
    setUpdatingCategory(id);
    setCategorySettingsError("");
    try {
      const response = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, available: !categoryAvailability[id] }),
      });
      if (!response.ok) throw new Error(await responseError(response, "Category availability could not be updated."));
      const data = await response.json();
      setCategoryAvailability(data.availability);
    } catch (settingsError) {
      setCategorySettingsError(settingsError.message);
    } finally {
      setUpdatingCategory("");
    }
  }

  async function saveWhatsAppSettings(event) {
    event.preventDefault();
    setSavingWhatsappPhone(true);
    setWhatsappSettingsError("");
    setWhatsappSettingsNotice("");
    try {
      const response = await fetch("/api/admin/storefront-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappPhone }),
      });
      if (!response.ok) throw new Error(await responseError(response, "WhatsApp settings could not be saved."));
      const data = await response.json();
      setWhatsappPhone(`+${data.whatsappPhone}`);
      setWhatsappSettingsNotice("WhatsApp number updated.");
    } catch (settingsError) {
      setWhatsappSettingsError(settingsError.message);
    } finally {
      setSavingWhatsappPhone(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setProducts([]);
  }

  function removeFile(index) {
    const url = files[index].url;
    URL.revokeObjectURL(url);
    previewUrls.current.delete(url);
    setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  if (checkingSession) return <main className="admin-screen"><p>Checking admin access…</p></main>;

  if (!authenticated) {
    return (
      <main className="admin-screen">
        <form className="login-card" onSubmit={login}>
          <Link className="brand" href="/"><HeaderLogo /></Link>
          <p className="eyebrow">ADMIN ACCESS</p>
          <h1>Welcome back</h1>
          <label htmlFor="admin-password">Admin password</label>
          <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="admin-primary" type="submit">Sign in</button>
          <Link className="admin-back-link" href="/">← Back to the shop</Link>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-screen admin-screen-wide">
      <header className="admin-header">
        <Link className="brand" href="/"><HeaderLogo /></Link>
        <div><Link href="/">View shop</Link><button type="button" onClick={logout}>Sign out</button></div>
      </header>
      <div className="admin-content">
        <div className="admin-title"><div><p className="eyebrow">YOUR ATELIER</p><h1>Product studio</h1></div><p>{products.length} {products.length === 1 ? "product" : "products"}</p></div>
        <section className="admin-panel availability-panel">
          <h2>Shop sections</h2>
          <p className="admin-hint">Choose which sections appear in the shop navigation. Sections start available; hiding one also hides its products from the storefront.</p>
          {categorySettingsError && <p className="form-error" role="alert">{categorySettingsError}</p>}
          <div className="category-settings">
            {NAV_SECTIONS.map((section) => (
              <div className="category-setting-group" key={section.id}>
                <label className="category-setting">
                  <span><strong>{section.label}</strong><small>{section.description}</small></span>
                  <input type="checkbox" checked={categoryAvailability[section.id]} disabled={updatingCategory === section.id} onChange={() => toggleCategory(section.id)} aria-label={`${section.label} available in the shop`} />
                </label>
                {section.children && <div className="service-settings">
                  {section.children.map((service) => (
                    <label className="category-setting service-setting" key={service.id}>
                      <span><strong>{service.label}</strong></span>
                      <input type="checkbox" checked={categoryAvailability[service.id]} disabled={updatingCategory === service.id || !categoryAvailability[section.id]} onChange={() => toggleCategory(service.id)} aria-label={`${service.label} available in the shop`} />
                    </label>
                  ))}
                </div>}
              </div>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <h2>WhatsApp contact</h2>
          <p className="admin-hint">This number is used by the floating WhatsApp button across the storefront. Include the country code.</p>
          <form className="whatsapp-settings-form" onSubmit={saveWhatsAppSettings}>
            <label htmlFor="whatsapp-phone">WhatsApp phone number</label>
            <div className="whatsapp-settings-row">
              <input id="whatsapp-phone" type="tel" inputMode="tel" autoComplete="tel" value={whatsappPhone} onChange={(event) => setWhatsappPhone(event.target.value)} placeholder="+2349066455450" required />
              <button className="admin-primary" type="submit" disabled={savingWhatsappPhone}>{savingWhatsappPhone ? "Saving…" : "Save number"}</button>
            </div>
            {whatsappSettingsError && <p className="form-error" role="alert">{whatsappSettingsError}</p>}
            {whatsappSettingsNotice && <p className="form-success" role="status">{whatsappSettingsNotice}</p>}
          </form>
        </section>
        <section className="admin-panel">
          <h2>CEO profile</h2>
          <p className="admin-hint">Update the CEO introduction and upload a portrait for the homepage.</p>
          <form className="product-form" onSubmit={saveCeoProfile}>
            <label>CEO name<input maxLength={120} value={ceoProfile.name} onChange={(event) => setCeoProfile({ ...ceoProfile, name: event.target.value })} required /></label>
            <label>Short description<textarea maxLength={1000} rows={3} value={ceoProfile.description} onChange={(event) => setCeoProfile({ ...ceoProfile, description: event.target.value })} required /></label>
            <label className="image-picker">CEO portrait <span>JPG, PNG, WebP, or AVIF · 10 MB max</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={chooseCeoImage} disabled={savingCeoProfile} />
            </label>
            {(ceoImagePreview || ceoProfile.image) && <div className="ceo-image-preview">
              <Image src={ceoImagePreview || ceoProfile.image} alt="CEO portrait preview" width={140} height={170} sizes="140px" unoptimized={Boolean(ceoImagePreview)} />
              <button className="admin-secondary" type="button" onClick={removeCeoImage} disabled={savingCeoProfile}>Remove photo</button>
            </div>}
            {ceoSettingsError && <p className="form-error" role="alert">{ceoSettingsError}</p>}
            {ceoSettingsNotice && <p className="form-success" role="status">{ceoSettingsNotice}</p>}
            <button className="admin-primary" type="submit" disabled={savingCeoProfile}>{savingCeoProfile ? "Uploading and saving…" : "Save CEO profile"}</button>
          </form>
        </section>
        <section className="admin-panel" id="product-editor">
          <h2>{editingProductId ? "Edit product" : "Create a product post"}</h2>
          <p className="admin-hint">{editingProductId ? "Update the product details, photos, or publication status." : "Add your design details and optionally upload up to five photos. Publish now or save it as a draft."}</p>
          <form onSubmit={saveProduct} className="product-form">
            <label>Product name<input maxLength={120} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
            <label>Description<textarea maxLength={2000} rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
            <div className="form-row">
              <label>Price (₦)<input type="number" min="1" max="100000000" step="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required /></label>
              <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{PRODUCT_CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.label}{!isCategoryAvailable(category.id, categoryAvailability) ? " (unavailable)" : ""}</option>)}</select></label>
            </div>
            <label className="image-picker">Product photos <span>Optional · JPG, PNG, WebP, AVIF · 10 MB max each · {existingImages.length + files.length}/5 selected</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={chooseFiles} disabled={existingImages.length + files.length >= 5} />
            </label>
            {(existingImages.length > 0 || files.length > 0) && <div className="preview-grid">
              {existingImages.map((url, index) => <div className="preview-item" key={`existing-${url}-${index}`}>
                <Image src={url} alt={`Current product photo ${index + 1}`} width={92} height={108} sizes="92px" />
                <button type="button" onClick={() => removeExistingImage(index)} aria-label={`Remove current image ${index + 1}`}>×</button></div>)}
              {files.map(({ url }, index) => 
              <div className="preview-item" key={url}><Image src={url} alt={`New product photo ${index + 1}`} width={92} height={108} unoptimized /><button type="button" onClick={() => removeFile(index)} aria-label={`Remove new image ${index + 1}`}>×</button></div>)}
            </div>}
            <label className="publish-option"><input type="checkbox" checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} /> Publish this product to the storefront</label>
            {error && <p className="form-error" role="alert">{error}</p>}
            {notice && <p className="form-success" role="status">{notice}</p>}
            <div className="product-form-actions">
              <button className="admin-primary" type="submit" disabled={submitting}>{submitting ? "Uploading and saving…" : editingProductId ? "Save changes" : "Create product"}</button>
              {editingProductId && <button className="admin-secondary" type="button" onClick={cancelEditing} disabled={submitting}>Cancel</button>}
            </div>
          </form>
        </section>

        <section className="admin-panel inventory-panel">
          <div className="inventory-heading"><h2>Product inventory</h2><button onClick={loadProducts} disabled={loadingProducts}>{loadingProducts ? "Refreshing…" : "Refresh"}</button></div>
          {inventoryError && <p className="form-error" role="alert">{inventoryError}</p>}
          {inventoryNotice && <p className="form-success" role="status">{inventoryNotice}</p>}
          {products.length === 0 && !loadingProducts ? <p className="admin-hint">No products yet. Create your first post above.</p> : <div className="inventory-list">
            {products.map((product) => {
              const images = Array.isArray(product.images) ? product.images : [];
              return (
                <article className="inventory-item" key={product.id}>
                  {images[0]
                    ? <Image src={images[0]} alt="" width={128} height={152} sizes="64px" />
                    : <div className="inventory-image-placeholder" aria-label="No product photo">MAU</div>}
                  <div className="inventory-info"><h3>{product.title}</h3><p>₦{product.price.toLocaleString("en-NG")} · {product.categoryLabel} · {images.length} {images.length === 1 ? "photo" : "photos"}</p></div>
                  <span className={product.isPublished ? "status-published" : "status-draft"}>{product.isPublished ? "Published" : "Draft"}</span>
                  <div className="inventory-actions">
                    <button className="status-toggle" type="button" onClick={() => startEditing(product)} disabled={Boolean(updatingId) || submitting}>Edit</button>
                    <button className="status-toggle" type="button" onClick={() => togglePublication(product)} disabled={Boolean(updatingId) || submitting}>{updatingId === product.id ? "Updating…" : product.isPublished ? "Unpublish" : "Publish"}</button>
                    <button className="status-toggle danger-button" type="button" onClick={() => deleteProduct(product)} disabled={Boolean(updatingId) || submitting}>{updatingId === product.id ? "Working…" : "Delete"}</button>
                  </div>
                </article>
              );
            })}
          </div>}
        </section>
      </div>
    </main>
  );
}
