import { PlaceHolderImages } from "./placeholder-images";
import { type Post } from "@/lib/types";

export const fishSpecies = [
  {
    id: "1",
    name: "Tuna",
    scientificName: "Thunnus",
    description: "A sleek and powerful predatory fish found in warm seas. Known for its impressive speed and endurance, it's a commercially important species worldwide.",
    habitat: "Pelagic",
    population: 85,
    stockTrend: "stable",
    imageId: "fish1",
    length: "1-2m",
    weight: "200-400kg",
    lifespan: "15-30 years",
    temperature: "17-31°C",
    depth: "0-500m",
    salinity: "Marine (32-37 PPT)",
    substrate: "Open water",
    diet: "Smaller fish, crustaceans, squid",
    reproduction: "Broadcast spawner, eggs drift in open water",
    conservationStatus: "Varies by species (e.g., Near Threatened)",
    dnaAvailable: "Yes (Global)",
    geneticMarkers: "COI, CYTB",
    sequenceSnippet: "ATGC...",
  },
  {
    id: "2",
    name: "Sardine",
    scientificName: "Sardinella",
    description: "Small, oily forage fish that form large schools.",
    habitat: "Coastal",
    population: 92,
    stockTrend: "increasing",
    imageId: "fish2",
    length: "15-30cm",
    weight: "50-100g",
    lifespan: "5-7 years",
    temperature: "14-20°C",
    depth: "10-100m",
    salinity: "Marine (30-35 PPT)",
    substrate: "Coastal waters",
    diet: "Phytoplankton, zooplankton",
    reproduction: "Batch spawner, releases eggs in batches",
    conservationStatus: "Least Concern",
    dnaAvailable: "Yes (Multiple regions)",
    geneticMarkers: "COI",
    sequenceSnippet: "GCTA...",
  },
  {
    id: "3",
    name: "Pomfret",
    scientificName: "Pampus",
    description: "Flat-bodied fish found in the Indian and Pacific Oceans.",
    habitat: "Nearshore",
    population: 70,
    stockTrend: "decreasing",
    imageId: "fish3",
    length: "30-65cm",
    weight: "1-2.5kg",
    lifespan: "4-6 years",
    temperature: "22-28°C",
    depth: "15-110m",
    salinity: "Brackish to Marine",
    substrate: "Sandy or muddy bottoms",
    diet: "Small invertebrates, fish larvae",
    reproduction: "Spawns in coastal waters",
    conservationStatus: "Data Deficient / Not Evaluated",
    dnaAvailable: "Limited",
    geneticMarkers: "16S rRNA",
    sequenceSnippet: "TTGA...",
  },
  {
    id: "4",
    name: "Mackerel",
    scientificName: "Scomber",
    description: "Fast-swimming fish known for its strong flavor.",
    habitat: "Pelagic",
    population: 88,
    stockTrend: "stable",
    imageId: "fish4",
    length: "30-50cm",
    weight: "0.5-1kg",
    lifespan: "Up to 20 years",
    temperature: "10-20°C",
    depth: "0-200m",
    salinity: "Marine",
    substrate: "Open water",
    diet: "Zooplankton, small fish",
    reproduction: "Pelagic spawner",
    conservationStatus: "Least Concern",
    dnaAvailable: "Yes (Atlantic & Pacific)",
    geneticMarkers: "COI, S7",
    sequenceSnippet: "CAGG...",
  },
];

export const initialCommunityPosts: Post[] = [
  {
    id: "1",
    author: "Ravi Kumar",
    avatarId: "avatar1",
    time: "2h ago",
    content:
      "Great catch of Mackerel today near the coast of Kerala. The new hotspot data is really accurate!",
    comments: 5,
    likes: 12,
  },
  {
    id: "2",
    author: "Dr. Anjali Sharma",
    avatarId: "avatar2",
    time: "5h ago",
    content:
      "Our latest research indicates a slight decrease in Pomfret populations in the Arabian Sea. We need to monitor this closely. #research #marinebiology",
    comments: 15,
    likes: 45,
  },
];

export const stockData = [
  { month: "Jan", Tuna: 4000, Pomfret: 2400 },
  { month: "Feb", Tuna: 3000, Pomfret: 1398 },
  { month: "Mar", Tuna: 2000, Pomfret: 9800 },
  { month: "Apr", Tuna: 2780, Pomfret: 3908 },
  { month: "May", Tuna: 1890, Pomfret: 4800 },
  { month: "Jun", Tuna: 2390, Pomfret: 3800 },
  { month: "Jul", Tuna: 3490, Pomfret: 4300 },
];

export const populationTrendData = [
    { year: 2000, abundance: 80, forecast: null },
    { year: 2005, abundance: 75, forecast: null },
    { year: 2010, abundance: 78, forecast: null },
    { year: 2015, abundance: 82, forecast: null },
    { year: 2020, abundance: 85, forecast: null },
    { year: 2024, abundance: 87, forecast: 87 },
    { year: 2025, abundance: null, forecast: 88 },
    { year: 2030, abundance: null, forecast: 90 },
];

export const analyticsData = {
  marineSustainabilityIndex: 78,
  stockAbundance: [
    { name: "Tuna", value: 400 },
    { name: "Sardine", value: 300 },
    { name: "Mackerel", value: 300 },
    { name: "Pomfret", value: 200 },
  ],
  biodiversity: [
    { date: "2023-01", species: 120 },
    { date: "2023-02", species: 125 },
    { date: "2023-03", species: 122 },
    { date: "2023-04", species: 128 },
    { date: "2023-05", species: 130 },
    { date: "2023-06", species: 135 },
  ],
  habitatHealth: 85,
};

export const alerts = {
  fisherman: [
    {
      id: 1,
      type: "Weather",
      content: "Strong winds expected tomorrow. Avoid deep-sea fishing.",
      time: "1h ago",
      severity: "high",
    },
    {
      id: 2,
      type: "Fish Availability",
      content: "High concentration of Sardines reported near Chennai coast.",
      time: "4h ago",
      severity: "medium",
    },
  ],
  scientist: [
    {
      id: 1,
      type: "Dataset Update",
      content: "New satellite imagery for the Bay of Bengal has been processed.",
      time: "2d ago",
      severity: "low",
    },
    {
      id: 2,
      type: "Anomaly",
      content: "Unusual sea surface temperature detected in the Palk Strait.",
      time: "1d ago",
      severity: "high",
    },
  ],
  policymaker: [
    {
      id: 1,
      type: "Sustainability Warning",
      content:
        "Shark finning incidents reported. Increased surveillance recommended.",
      time: "3h ago",
      severity: "high",
    },
  ],
};

export const habitatTypes = ["Coastal", "Pelagic", "Nearshore", "Deep-sea"];
export const regions = ["Kerala", "Tamil Nadu", "Maharashtra", "Goa"];
export const populationIndexes = ["High", "Medium", "Low"];
export const seasons = ["Monsoon", "Post-monsoon", "Year-round"];

// Function to find image URL from placeholder data
export const getImageUrl = (id: string) => {
  const image = PlaceHolderImages.find((img) => img.id === id);
  return image
    ? image.imageUrl
    : "https://picsum.photos/seed/default/400/300";
};

// Mock API for community posts
let communityPosts: Post[] = [...initialCommunityPosts];

export const getCommunityPosts = async (): Promise<Post[]> => {
  return Promise.resolve(communityPosts);
};

export const addCommunityPost = async (content: string): Promise<Post> => {
  const newPost: Post = {
    id: (communityPosts.length + 1).toString(),
    author: "John Doe",
    avatarId: "avatar1",
    time: "Just now",
    content,
    comments: 0,
    likes: 0,
  };
  communityPosts = [newPost, ...communityPosts];
  return Promise.resolve(newPost);
};

// Mock API for settings
let userSettings = {
  name: "John Doe",
  email: "john.doe@example.com",
  userType: "fisherman",
  language: "en",
  darkMode: false,
};

export const getSettings = async () => {
    return Promise.resolve(userSettings);
}

export const saveSettings = async (newSettings: typeof userSettings) => {
    userSettings = { ...userSettings, ...newSettings };
    return Promise.resolve(userSettings);
}
