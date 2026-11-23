import CatalogPage from "@/components/catalog-page";

export const metadata = {
  title: "Sewing Machine Parts | Mau Designs & Collections",
  description: "Shop sewing machine needles, plates, ropes, reels and other machine parts from Mau.",
};

export default function SewingMachinePartsPage() {
  return <CatalogPage kind="category" categoryId="sewing-machine-parts" />;
}
