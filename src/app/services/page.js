import CatalogPage from "@/components/catalog-page";

export const metadata = {
  title: "Services | Mau Designs & Collections",
  description: "Explore sewing, amendment, training and weaving services from Mau.",
};

export default async function ServicesPage({ searchParams }) {
  const params = await searchParams;
  const initialService = typeof params.type === "string" ? params.type : "All";
  return <CatalogPage kind="services" initialService={initialService} />;
}
