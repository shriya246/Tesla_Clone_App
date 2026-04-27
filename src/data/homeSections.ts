import type {
  ChargingSectionData,
  EnergySectionData,
  FeatureSectionData,
  HeroSectionData,
  OfferSectionData,
  ProductSectionData,
} from "@/types";

export const heroSection: HeroSectionData = {
  title: "Full Self-Driving (Supervised)",
  subtitle: "Available for $99/mo",
  primaryButton: "Demo FSD (Supervised)",
  secondaryButton: "Learn More",
  image: "/images/fsd-hero.jpg",
};

export const productSections: ProductSectionData[] = [
  {
    title: "Model S",
    subtitle: "Luxury sedan with up to 405 miles of range and exhilarating performance.",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/model-s.jpg",
  },
  {
    title: "Model 3",
    subtitle: "A refined everyday EV with sleek design, advanced tech, and confident range.",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/model-3.jpg",
  },
  {
    title: "Model X",
    subtitle: "Three-row utility, Falcon Wing doors, and premium comfort for every mile.",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/model-x.jpg",
  },
  {
    title: "Model Y",
    subtitle: "Versatile electric SUV with spacious seating, cargo flexibility, and all-weather capability.",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/model-y.jpg",
  },
  {
    title: "Cybertruck",
    subtitle: "A bold all-electric pickup engineered for utility, toughness, and standout design.",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/cybertruck.jpg",
  },
];

export const offerSections: OfferSectionData[] = [
  {
    title: "Current Offers",
    description:
      "Explore limited-time lease and purchase opportunities designed to make upgrading into a Tesla feel seamless, elevated, and immediate.",
    primaryButton: "View Offers",
    secondaryButton: "Schedule a Drive",
    image: "/images/current-offers.jpg",
    badge: "Limited Time",
  },
  {
    title: "Military, First Responders, Teachers & Students",
    description:
      "Special pricing opportunities for communities making an impact every day, with a streamlined path to ownership across select Tesla vehicles.",
    primaryButton: "See Eligibility",
    secondaryButton: "Learn More",
    image: "/images/community-offers.jpg",
    badge: "Special Pricing",
  },
];

export const featureSections: FeatureSectionData[] = [
  {
    title: "Travel Safer with Active Safety Features",
    description:
      "Every Tesla is engineered with features that continuously support awareness, visibility, and confident decision-making on the road.",
    image: "/images/active-safety.jpg",
    linkText: "Explore Safety",
  },
  {
    title: "Features That Come Standard",
    description:
      "From intuitive controls to connected convenience, core Tesla technology is built in from day one to create a premium ownership experience.",
    image: "/images/standard-features.jpg",
    linkText: "See What's Included",
  },
];

export const chargingSection: ChargingSectionData = {
  title: "Find Your Charge",
  description:
    "Access a fast, reliable charging experience across highways, cities, and destinations with an expansive Tesla charging network built for daily life and long-distance travel.",
  image: "/images/charging-network.jpg",
  primaryButton: "Explore Charging",
  secondaryButton: "Trip Planner",
  stats: [
    {
      value: "60,000+",
      label: "Superchargers",
      description:
        "Fast charging locations positioned to support road trips, commuting, and high-traffic travel corridors.",
    },
    {
      value: "10,000+",
      label: "Destination Chargers",
      description:
        "Convenient charging at hotels, restaurants, resorts, and premium stops along the way.",
    },
  ],
};

export const energySections: EnergySectionData[] = [
  {
    title: "Solar Panels",
    description:
      "Generate clean energy with a low-profile solar system designed to complement modern homes and help reduce reliance on the grid.",
    image: "/images/solar-panels.jpg",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
  },
  {
    title: "Powerwall",
    description:
      "Store energy for outage protection, time-of-use savings, and greater control over how your home consumes and reserves power.",
    image: "/images/powerwall.jpg",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
  },
];
