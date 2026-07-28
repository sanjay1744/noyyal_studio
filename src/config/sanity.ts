import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(sanityConfig);

const builder = imageUrlBuilder(sanityClient);
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}

// ── INTERFACES ──
export type ProjectCategory = "Residences" | "Commercial" | "Interior" | "Unbuilt";

export interface Project {
  num: string;
  name: string;
  category: ProjectCategory;
  type: string;
  year: string;
  location: string;
  status: "built" | "ongoing" | "study" | "unbuilt";
  area: string;
  program: string;
  desc: string;
  tags: string[];
  heroImage: string;
  gallery: string[];
}

export interface ResearchArticle {
  num: string;
  status: string;
  title: string;
  body: string;
  tags: string[];
}

// ── MOCK DATA FALLBACKS ──
export const MOCK_PROJECTS: Project[] = [
  {
    num: "NS — 001",
    name: "House on the Slope",
    category: "Residences",
    type: "Residential",
    year: "2024",
    location: "Coimbatore, Tamil Nadu",
    status: "built",
    area: "280 sqm",
    program: "Single family residence",
    desc: "A home carved into a laterite slope, mediating between the hillside and the valley below. The section defines three levels of inhabitation — each opening differently to the landscape.",
    tags: ["Slope", "Laterite", "Section", "Landscape"],
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 002",
    name: "River Bend Sanctuary",
    category: "Residences",
    type: "Residential",
    year: "2023",
    location: "Palakkad, Kerala",
    status: "built",
    area: "340 sqm",
    program: "Family home & courtyard",
    desc: "Sited on the bend of a seasonal river. The house is oriented around a central courtyard that frames the sound of water while protecting against monsoon flooding through a raised stone plinth.",
    tags: ["Courtyard", "Water", "Monsoon", "Plinth"],
    heroImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472591-ee6c563aaec9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-35f133c65dae?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 003",
    name: "Kodaikanal Hillside Retreat",
    category: "Residences",
    type: "Residential",
    year: "2022",
    location: "Kodaikanal, Tamil Nadu",
    status: "built",
    area: "190 sqm",
    program: "Hill country villa",
    desc: "A small vacation home in the Palani Hills — built almost entirely from locally quarried granite and tactile timber. Organized around a single long axis towards the distant valley fog.",
    tags: ["Granite", "Hillside", "Timber", "Framed Views"],
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 004",
    name: "Noyyal Craft & Cultural Center",
    category: "Commercial",
    type: "Commercial",
    year: "2024",
    location: "Coimbatore, Tamil Nadu",
    status: "built",
    area: "1,450 sqm",
    program: "Exhibition spaces & workshops",
    desc: "A public architectural complex designed for regional artisans. Heavy masonry masses are pierced by high vaulted light-wells that cast dramatic sun shadows throughout the day.",
    tags: ["Masonry", "Cultural", "Lightwells", "Exhibition"],
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 005",
    name: "Basalt Guild Headquarters",
    category: "Commercial",
    type: "Commercial",
    year: "2023",
    location: "Chennai, Tamil Nadu",
    status: "built",
    area: "980 sqm",
    program: "Corporate offices & design studios",
    desc: "A modern commercial workspace built with exposed cast concrete and louvred dark basalt panels, optimizing natural cross-ventilation in tropical urban heat.",
    tags: ["Office", "Basalt", "Concrete", "Cross-ventilation"],
    heroImage: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 006",
    name: "Monolithic Micro-Cement Penthouse",
    category: "Interior",
    type: "Interior",
    year: "2024",
    location: "Bengaluru, Karnataka",
    status: "built",
    area: "310 sqm",
    program: "Residential interior transformation",
    desc: "A tactile interior landscape utilizing hand-troweled warm micro-cement, dark walnut joinery, and concealed ambient light troughs to create a seamless sanctuary above the city.",
    tags: ["Interior", "Micro-Cement", "Walnut", "Tactile"],
    heroImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 007",
    name: "Architectural Teak Atelier",
    category: "Interior",
    type: "Interior",
    year: "2023",
    location: "Kochi, Kerala",
    status: "built",
    area: "220 sqm",
    program: "Studio & gallery interior",
    desc: "Crafted entirely using reclaimed Malabar teak and raw brass accents. The space functions as both an architectural studio and an intimate private gallery.",
    tags: ["Teak", "Interior", "Reclaimed", "Studio"],
    heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 008",
    name: "Terra Cotta Monolith Study",
    category: "Unbuilt",
    type: "Unbuilt",
    year: "2025",
    location: "Madurai, Tamil Nadu",
    status: "unbuilt",
    area: "620 sqm",
    program: "Speculative research pavilion",
    desc: "An unbuilt conceptual pavilion exploring traditional Dravidian brick firing technique transformed into a structural shell. The structure forms a microclimate canopy.",
    tags: ["Unbuilt", "Terra Cotta", "Speculative", "Shell Structure"],
    heroImage: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    num: "NS — 009",
    name: "Floating Timber & Water Canopy",
    category: "Unbuilt",
    type: "Unbuilt",
    year: "2025",
    location: "Wayanad, Kerala",
    status: "unbuilt",
    area: "410 sqm",
    program: "Eco-tourism sanctuary conceptual competition",
    desc: "A cantilevered lattice timber canopy designed to hover above a rain catchment basin, creating an off-grid sanctuary powered by passive air draft and rainwater harvesting.",
    tags: ["Unbuilt", "Timber Lattice", "Rain Catchment", "Eco"],
    heroImage: "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export const MOCK_RESEARCH: ResearchArticle[] = [
  {
    num: "RS — 01",
    status: "Ongoing",
    title: "Vernacular Cooling in Dravidian Domestic Space",
    body: "An investigation into pre-industrial passive cooling strategies embedded in Tamil Nadu's traditional courtyard homes — and how they may inform contemporary residential design under warming climates.",
    tags: ["Climate", "Vernacular", "Tamil Nadu"]
  },
  {
    num: "RS — 02",
    status: "Ongoing",
    title: "Threshold as Architectural Event",
    body: "A phenomenological study of entry sequences in South Indian homes — from the kolam-marked threshold to the transitional verandah — asking what it means for a building to mark arrival.",
    tags: ["Phenomenology", "Ritual", "Domesticity"]
  },
  {
    num: "RS — 03",
    status: "Published 2023",
    title: "Light, Shadow, and the Brick Wall",
    body: "A material study tracing how brick — raw, plastered, exposed — mediates between inside and outside in contemporary residential buildings across Tamil Nadu and Kerala.",
    tags: ["Materials", "Light", "Brick"]
  },
  {
    num: "RS — 04",
    status: "In Progress",
    title: "Room as Memory: Spatial Autobiography",
    body: "Collaborating with residents of long-inhabited homes to map how rooms accumulate meaning over generations — studying architecture as a container of personal and collective memory.",
    tags: ["Memory", "Participatory", "Ethnography"]
  }
];

// Helper functions to fetch data
export async function getProjects(): Promise<Project[]> {
  const isConfigured = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
                      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder-project-id";
  if (isConfigured) {
    try {
      const query = `*[_type == "project"] | order(year desc) {
        num, name, type, year, location, status, area, program, desc, tags
      }`;
      const data = await sanityClient.fetch(query);
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Sanity fetch failed, falling back to mock data:", e);
    }
  }
  return MOCK_PROJECTS;
}

export async function getResearch(): Promise<ResearchArticle[]> {
  const isConfigured = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID && 
                      process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== "placeholder-project-id";
  if (isConfigured) {
    try {
      const query = `*[_type == "research"] | order(num asc) {
        num, status, title, body, tags
      }`;
      const data = await sanityClient.fetch(query);
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn("Sanity fetch failed, falling back to mock data:", e);
    }
  }
  return MOCK_RESEARCH;
}
