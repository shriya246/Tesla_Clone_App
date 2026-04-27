import type {
  PageHeaderData,
  ShopFeatureData,
  ShopProductData,
} from "@/types";

export const shopPageHeader: PageHeaderData = {
  title: "Shop",
  subtitle:
    "Browse accessories, charging essentials, and lifestyle products through a dedicated Tesla-inspired retail experience.",
  image: "/images/shop-header.jpg",
  primaryButton: {
    label: "Browse Products",
    href: "#shop-products",
  },
  secondaryButton: {
    label: "Shop Highlights",
    href: "#shop-features",
  },
};

export const shopProducts: ShopProductData[] = [
  {
    slug: "wall-connector",
    title: "Wall Connector",
    description:
      "A sleek at-home charging solution that brings faster, more convenient overnight charging into your daily routine.",
    longDescription:
      "Wall Connector is built for a dedicated home-charging setup, giving owners a polished, always-ready solution that feels purpose-built for everyday charging confidence.",
    price: "$475",
    image: "/images/shop-wall-connector.jpg",
    primaryButton: "Add to Bag",
    secondaryButton: "Learn More",
    badge: "Best Seller",
    highlights: [
      {
        title: "Home-ready charging",
        description:
          "Create a dedicated charging location that feels integrated into the garage or driveway instead of improvised.",
      },
      {
        title: "Streamlined visual design",
        description:
          "The form factor stays clean and minimal so the hardware feels aligned with a more premium ownership experience.",
      },
      {
        title: "Daily-use convenience",
        description:
          "An always-installed setup reduces friction and makes overnight charging easier to build into a routine.",
      },
    ],
    specs: [
      { label: "Use Case", value: "Home charging" },
      { label: "Placement", value: "Garage or exterior wall" },
      { label: "Design", value: "Dedicated install" },
    ],
  },
  {
    slug: "mobile-charger",
    title: "Mobile Charger",
    description:
      "Portable charging hardware designed for flexibility on the road, at home, or wherever convenient outlet access is available.",
    longDescription:
      "Mobile Charger gives owners a flexible backup or travel-friendly charging option, making it easier to stay prepared when charging needs shift away from a permanent setup.",
    price: "$300",
    image: "/images/shop-mobile-charger.jpg",
    primaryButton: "Add to Bag",
    secondaryButton: "Learn More",
    highlights: [
      {
        title: "Travel-friendly setup",
        description:
          "Portable hardware makes it easier to bring charging support along for road trips, temporary parking, and flexible routines.",
      },
      {
        title: "Reliable backup option",
        description:
          "It works well as a secondary charging solution when a fixed home installation is not the right fit.",
      },
      {
        title: "Designed for convenience",
        description:
          "Compact proportions help the kit store cleanly without taking over valuable cabin or trunk space.",
      },
    ],
    specs: [
      { label: "Use Case", value: "Portable charging" },
      { label: "Storage", value: "Travel ready" },
      { label: "Fit", value: "Home and away" },
    ],
  },
  {
    slug: "roof-rack",
    title: "Roof Rack",
    description:
      "Expand cargo capability with a minimalist roof rack system built for road trips, gear transport, and everyday practicality.",
    longDescription:
      "Roof Rack adds flexible carrying capacity for bikes, boards, bags, and oversized gear while preserving a clean silhouette that still feels matched to the vehicle design.",
    price: "$500",
    image: "/images/shop-roof-rack.jpg",
    primaryButton: "Add to Bag",
    secondaryButton: "Learn More",
    highlights: [
      {
        title: "Extra utility on demand",
        description:
          "Make room for weekend gear and oversized cargo without giving up interior comfort for passengers.",
      },
      {
        title: "Clean integrated look",
        description:
          "The rack system is designed to feel compatible with the vehicle rather than like an afterthought.",
      },
      {
        title: "Adventure-ready flexibility",
        description:
          "Support trips that need more space, from sports equipment and luggage to outdoor essentials.",
      },
    ],
    specs: [
      { label: "Use Case", value: "Cargo expansion" },
      { label: "Ideal For", value: "Trips and gear" },
      { label: "Look", value: "Low-profile setup" },
    ],
  },
  {
    slug: "lifestyle-apparel",
    title: "Lifestyle Apparel",
    description:
      "A curated range of apparel and everyday accessories carrying the same premium, understated design language.",
    longDescription:
      "Lifestyle Apparel extends the brand experience beyond the vehicle with understated pieces and everyday accessories shaped around comfort, utility, and clean design.",
    price: "$35",
    image: "/images/shop-lifestyle-apparel.jpg",
    primaryButton: "Shop Collection",
    secondaryButton: "Learn More",
    badge: "New",
    highlights: [
      {
        title: "Minimal everyday style",
        description:
          "Pieces are styled to feel versatile, wearable, and consistent with the broader Tesla-inspired aesthetic.",
      },
      {
        title: "Gift-friendly collection",
        description:
          "Apparel and accessories make the category a strong fit for casual gifting as well as personal use.",
      },
      {
        title: "Brand beyond the vehicle",
        description:
          "The collection gives fans a softer lifestyle touchpoint that complements the tech-led product line.",
      },
    ],
    specs: [
      { label: "Category", value: "Apparel and accessories" },
      { label: "Style", value: "Understated and premium" },
      { label: "Use", value: "Daily lifestyle" },
    ],
  },
  {
    slug: "model-car",
    title: "Model Car",
    description:
      "A display-ready scaled collectible that turns a signature Tesla silhouette into a desk or shelf centerpiece.",
    longDescription:
      "Model Car is designed as a display object for enthusiasts, pairing collector appeal with a clean presentation that fits naturally into a workspace, shelf, or gift setup.",
    price: "$95",
    image: "/images/shop-model-car.jpg",
    primaryButton: "Add to Bag",
    secondaryButton: "Learn More",
    highlights: [
      {
        title: "Collector-focused appeal",
        description:
          "A scaled vehicle makes the product especially suited to display, gifting, and fandom-driven collections.",
      },
      {
        title: "Desk-friendly footprint",
        description:
          "Compact sizing helps it fit naturally into offices, shelves, and home setups without needing much space.",
      },
      {
        title: "Design-led presentation",
        description:
          "The product works best when it feels like a small design object rather than just a generic toy.",
      },
    ],
    specs: [
      { label: "Category", value: "Collectible" },
      { label: "Placement", value: "Desk or shelf" },
      { label: "Audience", value: "Fans and gift buyers" },
    ],
  },
  {
    slug: "charging-bundle",
    title: "Charging Bundle",
    description:
      "A packaged set of charging essentials that simplifies setup for home readiness, travel, and backup flexibility.",
    longDescription:
      "Charging Bundle brings together complementary charging gear in one streamlined package so owners can get started faster and cover more charging scenarios with less guesswork.",
    price: "$695",
    image: "/images/shop-charging-bundle.jpg",
    primaryButton: "Add to Bag",
    secondaryButton: "Learn More",
    badge: "Bundle",
    highlights: [
      {
        title: "Simplified decision-making",
        description:
          "Bundled products reduce the friction of figuring out which charging pieces to buy together.",
      },
      {
        title: "Better setup coverage",
        description:
          "The mix of accessories supports a wider range of daily and travel charging moments.",
      },
      {
        title: "Ready from day one",
        description:
          "A bundled kit helps new owners feel more prepared right away without piecing together essentials later.",
      },
    ],
    specs: [
      { label: "Category", value: "Charging kit" },
      { label: "Best For", value: "New owner setup" },
      { label: "Focus", value: "Home plus travel" },
    ],
  },
];

export const shopFeatures: ShopFeatureData[] = [
  {
    title: "Gear Designed Around Utility",
    description:
      "Shop products are selected to support charging, travel, storage, and the day-to-day ownership experience with purpose-built design.",
    image: "/images/shop-feature-utility.jpg",
    linkText: "See Utility Picks",
  },
  {
    title: "Charging Essentials for Home and Away",
    description:
      "Browse chargers, adapters, and accessories that make everyday charging feel more reliable, portable, and polished.",
    image: "/images/shop-feature-charging.jpg",
    linkText: "Explore Charging Gear",
  },
];
