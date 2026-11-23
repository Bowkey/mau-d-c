import CatalogPage from "@/components/catalog-page";

export const metadata = {
  title: "Fabrics | Mau Designs & Collections",
  description: "Explore fabrics available from Mau Designs & Collections.",
};

export default function FabricsPage() {
  return <CatalogPage kind="category" categoryId="fabrics" />;
}
