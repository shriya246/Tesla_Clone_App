import type { PageHeaderData, VehicleData } from "@/types";

export const vehiclesPageHeader: PageHeaderData = {
  title: "Vehicles",
  subtitle:
    "Explore the Tesla lineup through a dedicated multi-page experience designed around performance, range, and everyday usability.",
  image: "/images/vehicles-header.jpg",
  primaryButton: {
    label: "Browse Lineup",
    href: "#vehicles-lineup",
  },
  secondaryButton: {
    label: "Compare Models",
    href: "#vehicles-lineup",
  },
};

export const vehicleLineup: VehicleData[] = [
  {
    slug: "model-s",
    title: "Model S",
    subtitle:
      "Flagship sedan with exceptional range, immersive technology, and performance tuned for long-distance confidence.",
    longDescription:
      "Model S brings together long-range capability, sharp performance, and a calm, premium cabin so the drive feels equally composed on a daily commute or a cross-country sprint.",
    price: "$74,990",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/vehicles-model-s.jpg",
    specs: [
      { label: "Range", value: "Up to 405 mi" },
      { label: "0-60 mph", value: "3.1 sec" },
      { label: "Top Speed", value: "149 mph" },
      { label: "Seating", value: "Up to 5" },
    ],
    highlights: [
      {
        title: "Long-distance confidence",
        description:
          "A high-range battery setup keeps road trips feeling practical without losing the premium feel expected from a flagship sedan.",
      },
      {
        title: "Immersive interior experience",
        description:
          "A panoramic cabin, minimalist controls, and a refined center display create a clean space that still feels deeply capable.",
      },
      {
        title: "Performance-led refinement",
        description:
          "Quick acceleration and planted highway behavior give Model S the feel of a modern grand tourer built around electric torque.",
      },
    ],
  },
  {
    slug: "model-3",
    title: "Model 3",
    subtitle:
      "Streamlined everyday EV with refined comfort, intuitive cabin controls, and accessible long-range capability.",
    longDescription:
      "Model 3 is designed to make the everyday EV experience feel polished and approachable, combining clean design, practical range, and a cabin that keeps distractions to a minimum.",
    price: "$38,990",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/vehicles-model-3.jpg",
    specs: [
      { label: "Range", value: "Up to 363 mi" },
      { label: "0-60 mph", value: "4.9 sec" },
      { label: "Drive", value: "RWD or AWD" },
      { label: "Seating", value: "Up to 5" },
    ],
    highlights: [
      {
        title: "Made for every day",
        description:
          "Its size, efficiency, and cabin layout make Model 3 feel especially well suited to commuting, errands, and long weekends away.",
      },
      {
        title: "Comfort without excess",
        description:
          "The interior keeps surfaces quiet and uncluttered while still delivering the connected features drivers expect in a modern EV.",
      },
      {
        title: "Confident efficiency",
        description:
          "A lightweight profile and efficient electric architecture help stretch range while preserving responsive acceleration.",
      },
    ],
  },
  {
    slug: "model-x",
    title: "Model X",
    subtitle:
      "Three-row utility vehicle with Falcon Wing doors, spacious versatility, and premium road-trip comfort.",
    longDescription:
      "Model X balances dramatic design with practical three-row flexibility, giving families and larger crews an EV that still feels elevated, spacious, and road-trip ready.",
    price: "$79,990",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/vehicles-model-x.jpg",
    specs: [
      { label: "Range", value: "Up to 335 mi" },
      { label: "0-60 mph", value: "3.8 sec" },
      { label: "Cargo", value: "Room for gear" },
      { label: "Seating", value: "Up to 7" },
    ],
    highlights: [
      {
        title: "Flexible three-row layout",
        description:
          "The cabin is set up to support passengers, luggage, and the shifting needs of family travel without feeling compromised.",
      },
      {
        title: "Distinctive access design",
        description:
          "Falcon Wing doors give Model X a signature look while also making entry and loading feel easier in tighter spaces.",
      },
      {
        title: "Touring-ready comfort",
        description:
          "Long-distance seating comfort and a quiet electric ride make larger trips feel calmer for everyone on board.",
      },
    ],
  },
  {
    slug: "model-y",
    title: "Model Y",
    subtitle:
      "Compact SUV built for flexible cargo, confident all-weather use, and a clean, connected driving experience.",
    longDescription:
      "Model Y is the versatile middle ground in the lineup, pairing everyday usability, crossover practicality, and EV efficiency in a shape that works for families, commuters, and adventure gear alike.",
    price: "$43,990",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/vehicles-model-y.jpg",
    specs: [
      { label: "Range", value: "Up to 330 mi" },
      { label: "Cargo", value: "Flexible rear storage" },
      { label: "Drive", value: "Available AWD" },
      { label: "Seating", value: "Up to 7" },
    ],
    highlights: [
      {
        title: "Sized for real life",
        description:
          "It offers a raised driving position and generous cargo access while still staying manageable in dense city and suburban settings.",
      },
      {
        title: "Travel-ready versatility",
        description:
          "Fold-flat storage and optional seating flexibility make it easier to adapt from weekday commuting to weekend escape mode.",
      },
      {
        title: "Clean connected cabin",
        description:
          "A minimalist dash, large central display, and quiet ride create a focused space that keeps the experience feeling modern.",
      },
    ],
  },
  {
    slug: "cybertruck",
    title: "Cybertruck",
    subtitle:
      "An all-electric truck with angular presence, practical utility, and the unmistakable feel of a next-generation machine.",
    longDescription:
      "Cybertruck is built to feel different from the moment it appears, combining a durable visual identity with everyday utility, electric capability, and a cabin that keeps the experience unmistakably futuristic.",
    price: "$79,990",
    primaryButton: "Order Now",
    secondaryButton: "Learn More",
    image: "/images/vehicles-cybertruck.jpg",
    specs: [
      { label: "Range", value: "Up to 340 mi" },
      { label: "Towing", value: "Built for utility" },
      { label: "Bed", value: "Secure gear storage" },
      { label: "Drive", value: "Dual or tri motor" },
    ],
    highlights: [
      {
        title: "Utility-first design",
        description:
          "The form is engineered to feel bold and functional, with cargo and capability cues that support work and recreation.",
      },
      {
        title: "Striking road presence",
        description:
          "Its angular silhouette turns the truck into a statement piece without giving up the usefulness expected from the category.",
      },
      {
        title: "Electric truck capability",
        description:
          "Strong torque delivery and flexible storage make it feel ready for hauling gear, commuting, and weekend duty alike.",
      },
    ],
  },
];
