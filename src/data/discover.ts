import type { DiscoverTopicData, PageHeaderData } from "@/types";

export const discoverPageHeader: PageHeaderData = {
  title: "Discover",
  subtitle:
    "Browse stories, guides, and ecosystem highlights that frame the broader Tesla-inspired experience beyond a single landing page.",
  image: "/images/discover-header.jpg",
  primaryButton: {
    label: "Start Exploring",
    href: "#discover-topics",
  },
  secondaryButton: {
    label: "Latest Stories",
    href: "#discover-topics",
  },
};

export const discoverTopics: DiscoverTopicData[] = [
  {
    title: "Travel Smarter Across a Connected Network",
    description:
      "Explore how route planning, charging access, and in-vehicle technology can shape a more seamless long-distance drive.",
    image: "/images/discover-topic-travel.jpg",
    linkText: "Read the Story",
  },
  {
    title: "Designing for a Cleaner Home Energy Future",
    description:
      "See how solar generation, storage, and intelligent usage patterns work together in a more resilient energy ecosystem.",
    image: "/images/discover-topic-energy.jpg",
    linkText: "Explore the Feature",
  },
  {
    title: "Technology That Comes Standard",
    description:
      "Dive into the software, safety, and connected interface decisions that help define the Tesla-inspired ownership experience.",
    image: "/images/discover-topic-technology.jpg",
    linkText: "See the Highlights",
  },
  {
    title: "Lifestyle Accessories for Everyday Utility",
    description:
      "Discover how charging essentials, travel accessories, and lifestyle products extend the brand feel beyond the vehicle itself.",
    image: "/images/discover-topic-lifestyle.jpg",
    linkText: "Browse the Edit",
  },
];
