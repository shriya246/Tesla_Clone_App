import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PageHeader } from "@/components/PageHeader";
import { ProductSection } from "@/components/ProductSection";
import { vehicleLineup, vehiclesPageHeader } from "@/data/vehicles";

export default function VehiclesPage() {
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
