import type {
  ChargingHighlightData,
  ChargingSectionData,
  PageHeaderData,
} from "@/types";

export const chargingPageHeader: PageHeaderData = {
  title: "Charging",
  subtitle:
    "Access fast charging, home solutions, and route planning tools in a focused charging hub built for every kind of trip.",
  image: "/images/charging-header.jpg",
  primaryButton: {
    label: "Find Your Charge",
    href: "#charging",
  },
  secondaryButton: {
    label: "Charging Highlights",
    href: "#charging-highlights",
  },
};

export const chargingNetworkSection: ChargingSectionData = {
  title: "Find Your Charge",
  description:
    "Tap into a reliable charging network with fast roadside stops, convenient destination chargers, and trip planning built around real driving routines.",
  image: "/images/charging-network-page.jpg",
  primaryButton: "Explore Charging",
  secondaryButton: "Plan a Trip",
  stats: [
    {
      value: "60,000+",
      label: "Superchargers",
      description:
        "Fast charging locations built for efficient highway stops and confident cross-country travel.",
    },
    {
      value: "10,000+",
      label: "Destination Chargers",
      description:
        "Convenient charging access at hotels, restaurants, workplaces, and premium destinations.",
    },
  ],
};

export const chargingHighlights: ChargingHighlightData[] = [
  {
    title: "Fast Charging for Road Trips",
    description:
      "Spend less time stopped with strategically placed stations that keep long-distance travel simple and more predictable.",
    image: "/images/charging-highlight-roadtrips.jpg",
    linkText: "Plan Long Trips",
  },
  {
    title: "Home Charging That Fits Daily Life",
    description:
      "Wake up with a charged vehicle using at-home charging routines designed to fit your schedule and energy habits.",
    image: "/images/charging-highlight-home.jpg",
    linkText: "See Home Charging",
  },
];
