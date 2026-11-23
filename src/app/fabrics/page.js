import CatalogPage from "@/components/catalog-page";

export const metadata = {
  title: "Fabrics | Mau Designs & Stitches",
  description: "Explore fabrics available from Mau Designs & Stitches.",
};

export default function FabricsPage() {
  return <CatalogPage kind="category" categoryId="fabrics" />;
}
