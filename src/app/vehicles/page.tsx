import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { ProductSection } from "@/components/ProductSection";
import { vehiclesPageHeader } from "@/data/vehicles";
import { getAllVehicles } from "@/lib/db/vehicles";

export const dynamic = "force-dynamic";

export default async function VehiclesPage() {
  const vehicleLineup = await getAllVehicles();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white">
        <PageHeader header={vehiclesPageHeader} />
        <div id="vehicles-lineup">
          {vehicleLineup.map((vehicle) => (
            <ProductSection
              key={vehicle.slug}
              section={vehicle}
              detailHref={`/vehicles/${vehicle.slug}`}
              detailLabel="Explore vehicle"
              secondaryButtonHref={`/vehicles/${vehicle.slug}`}
            />
          ))}
        </div>
        <Footer />
      </main>
    </>
  );
}
