import CatalogPage from "@/components/catalog-page";

export const metadata = {
  title: "Sewing Accessories | Mau Designs & Stitches",
  description: "Shop threads, zips, needles, tapes and other sewing accessories from Mau.",
};

export default function SewingAccessoriesPage() {
  return <CatalogPage kind="category" categoryId="sewing-accessories" />;
}
