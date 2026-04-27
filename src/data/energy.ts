import type {
  EnergyProductData,
  FeatureSectionData,
  PageHeaderData,
} from "@/types";

export const energyPageHeader: PageHeaderData = {
  title: "Energy",
  subtitle:
    "See how solar generation, battery storage, and intelligent energy management can work together across modern homes.",
  image: "/images/energy-header.jpg",
  primaryButton: {
    label: "Explore Products",
    href: "#energy-products",
  },
  secondaryButton: {
    label: "Feature Overview",
    href: "#energy-features",
  },
};

export const energyProducts: EnergyProductData[] = [
  {
    slug: "solar-panels",
    title: "Solar Panels",
    description:
      "Produce clean electricity with a minimalist rooftop system designed to complement modern homes and reduce dependence on the grid.",
    longDescription:
      "Solar Panels are designed to blend into the roofline while producing dependable clean energy, helping homeowners reduce utility reliance and build a stronger foundation for the full home-energy ecosystem.",
    image: "/images/energy-solar-panels.jpg",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    highlights: [
      {
        title: "Low-profile rooftop aesthetic",
        description:
          "The panel layout is intended to feel visually intentional instead of distracting from the architecture of the home.",
      },
      {
        title: "Cleaner daily generation",
        description:
          "Produce power throughout the day and turn roof space into an active part of a more resilient home setup.",
      },
      {
        title: "Works with a broader system",
        description:
          "Solar production becomes more valuable when paired with storage, monitoring, and smarter home energy management.",
      },
    ],
    supportingFeatures: [
      {
        title: "Production visibility",
        description:
          "Track energy generation and system behavior through a connected experience that makes performance easy to understand.",
      },
      {
        title: "Designed for modern homes",
        description:
          "A minimalist visual profile helps the installation feel better aligned with clean architectural lines and contemporary exteriors.",
      },
      {
        title: "Energy ecosystem ready",
        description:
          "Panels are positioned as the starting point for a larger solar-plus-storage setup built around everyday control.",
      },
    ],
  },
  {
    slug: "powerwall",
    title: "Powerwall",
    description:
      "Store energy for outage protection, time-based control, and whole-home resilience with integrated battery backup.",
    longDescription:
      "Powerwall stores energy for when the home needs it most, supporting backup protection, smarter time-based usage, and a more controlled relationship between the house, the grid, and solar production.",
    image: "/images/energy-powerwall.jpg",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    highlights: [
      {
        title: "Backup when it matters",
        description:
          "Stored energy helps keep critical systems powered during outages and gives the home a stronger sense of continuity.",
      },
      {
        title: "Smarter daily control",
        description:
          "Shift how energy is stored and used across the day to better match household routines and time-based utility patterns.",
      },
      {
        title: "Works with solar generation",
        description:
          "Pairing storage with solar lets the system reserve excess energy for evening use or emergency backup scenarios.",
      },
    ],
    supportingFeatures: [
      {
        title: "Whole-home resilience",
        description:
          "The experience is centered on reducing disruption, keeping essential systems supported, and creating peace of mind.",
      },
      {
        title: "Connected monitoring",
        description:
          "Track stored energy, usage behavior, and backup reserve directly from a centralized interface.",
      },
      {
        title: "Flexible installation fit",
        description:
          "The storage solution is designed to work as a standalone resilience upgrade or as part of a broader home-energy stack.",
      },
    ],
  },
];

export const energyFeatures: FeatureSectionData[] = [
  {
    title: "Generate and Store in One Ecosystem",
    description:
      "Combine solar generation and battery storage in a single system that continuously balances production, usage, and reserve capacity.",
    image: "/images/energy-feature-ecosystem.jpg",
    linkText: "See System Benefits",
  },
  {
    title: "Designed for Everyday Control",
    description:
      "Track performance, reserve backup power, and understand energy flow through a more intentional, connected home-energy experience.",
    image: "/images/energy-feature-control.jpg",
    linkText: "Explore Controls",
  },
];
