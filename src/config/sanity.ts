import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient(sanityConfig);

const builder = createImageUrlBuilder(sanityClient);
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
  cinematicFrames?: string[];
  cinematicVideo?: string;
}

export interface ResearchArticle {
  num: string;
  status: string;
  title: string;
  body: string;
  tags: string[];
}

// ── 3D CINEMATIC FRAME SEQUENCES ──
export const NOOL_CINEMATIC_FRAMES: string[] = Array.from(
  { length: 30 },
  (_, i) => `/projects_/commercial/NOOL நூல்/frame_${String(i + 1).padStart(3, "0")}.jpg`
);

export const NOOL_CINEMATIC_VIDEO = "/projects_/commercial/nool/nool_cinematic.mp4";

// ── MOCK DATA FALLBACKS ──
export const MOCK_PROJECTS: Project[] = [
  {
    num: "NS — 000",
    name: "NOOL நூல் Pavilion",
    category: "Commercial",
    type: "Commercial",
    year: "2024",
    location: "Coimbatore, Tamil Nadu",
    status: "built",
    area: "850 sqm",
    program: "Textile & Craft Experience Pavilion",
    desc: "A cinematic architectural exploration celebrating regional weaving traditions. The massing features sweeping curved geometric brickwork and light wells that transform with sunlight.",
    tags: ["Craft", "Textile", "Brickwork", "Lightwell", "3D Shot"],
    heroImage: "/projects_/commercial/nool/frame_022.jpg",
    gallery: [
      "/projects_/commercial/nool/frame_001.jpg",
      "/projects_/commercial/nool/frame_007.jpg",
      "/projects_/commercial/nool/frame_015.jpg",
      "/projects_/commercial/nool/frame_022.jpg",
      "/projects_/commercial/nool/frame_030.jpg"
    ],
    cinematicVideo: NOOL_CINEMATIC_VIDEO,
  },
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
    heroImage: "/projects_/RESIDENCE/THE BLOCK HOUSE/5.png",
    gallery: [
      "/projects_/RESIDENCE/THE BLOCK HOUSE/5.png",
      "/projects_/RESIDENCE/THE BLOCK HOUSE/6.png",
      "/projects_/RESIDENCE/THE BLOCK HOUSE/7.png",
      "/projects_/RESIDENCE/THE BLOCK HOUSE/8.png"
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
    heroImage: "/projects_/RESIDENCE/WHITE WAVE/E1.jpg",
    gallery: [
      "/projects_/RESIDENCE/WHITE WAVE/E1.jpg",
      "/projects_/RESIDENCE/WHITE WAVE/E2.jpg",
      "/projects_/RESIDENCE/WHITE WAVE/E3.jpg",
      "/projects_/RESIDENCE/WHITE WAVE/E4.jpg",
      "/projects_/RESIDENCE/WHITE WAVE/01.png",
      "/projects_/RESIDENCE/WHITE WAVE/02.jpg"
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
    heroImage: "/projects_/RESIDENCE/OXIDE/KRT3.jpg",
    gallery: [
      "/projects_/RESIDENCE/OXIDE/KRT3.jpg",
      "/projects_/RESIDENCE/OXIDE/KRT5.jpg",
      "/projects_/RESIDENCE/OXIDE/KRT7.jpg",
      "/projects_/RESIDENCE/OXIDE/001krt.png",
      "/projects_/RESIDENCE/OXIDE/002krt.png",
      "/projects_/RESIDENCE/OXIDE/003krt.png",
      "/projects_/RESIDENCE/OXIDE/01.jpg",
      "/projects_/RESIDENCE/OXIDE/002.png"
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
    heroImage: "/projects_/commercial/THE WEAVERS/1.jpg",
    gallery: [
      "/projects_/commercial/THE WEAVERS/1.jpg",
      "/projects_/commercial/THE WEAVERS/2.jpg",
      "/projects_/commercial/THE WEAVERS/3.jpg",
      "/projects_/commercial/THE WEAVERS/4.jpg",
      "/projects_/commercial/THE WEAVERS/5.jpg",
      "/projects_/commercial/THE WEAVERS/6.jpg",
      "/projects_/commercial/THE WEAVERS/7.jpg",
      "/projects_/commercial/THE WEAVERS/8.jpg"
    ]
  },
  {
    num: "NS — 005",
    name: "The Frame Sanctuary",
    category: "Residences",
    type: "Residential",
    year: "2023",
    location: "Chennai, Tamil Nadu",
    status: "built",
    area: "380 sqm",
    program: "Urban residence & courtyards",
    desc: "A modern residence built with exposed cast concrete and louvred timber panels, optimizing natural cross-ventilation in tropical urban heat.",
    tags: ["Residence", "Frame", "Concrete", "Cross-ventilation"],
    heroImage: "/projects_/RESIDENCE/THE FRAME/14.png",
    gallery: [
      "/projects_/RESIDENCE/THE FRAME/14.png",
      "/projects_/RESIDENCE/THE FRAME/15.png",
      "/projects_/RESIDENCE/THE FRAME/16.png"
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
    heroImage: "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2025-10-30-14-21-39-668_002.jpg",
    gallery: [
      "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2025-10-30-14-21-39-668_002.jpg",
      "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2025-10-30-14-22-02-497_002.jpg",
      "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2025-10-30-14-23-07-996_002.jpg",
      "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2025-10-30-14-23-49-317_002.jpg",
      "/projects_/INTERIOR/BLOCK RESIDENCE/signal-2026-05-30-012737_002.jpeg",
      "/projects_/INTERIOR/BLOCK RESIDENCE/ChatGPT Image May 30, 2026, 01_49_55 AM.png"
    ]
  },
  {
    num: "NS — 007",
    name: "Architectural Teak Residence",
    category: "Residences",
    type: "Residential",
    year: "2023",
    location: "Kochi, Kerala",
    status: "built",
    area: "320 sqm",
    program: "Single family residence",
    desc: "A contemporary elevated residence crafted with exposed red clay brick massing, Malabar teak wood joinery, and expansive open balconies facing tropical foliage.",
    tags: ["Residence", "Teak", "Brickwork", "Elevation"],
    heroImage: "/projects_/RESIDENCE/Untitled folder/6.png",
    gallery: [
      "/projects_/RESIDENCE/Untitled folder/6.png",
      "/projects_/RESIDENCE/Untitled folder/7.png",
      "/projects_/RESIDENCE/Untitled folder/8.png"
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
    heroImage: "/projects_/UNBUILT/THE CONTRAST/a1.png",
    gallery: [
      "/projects_/UNBUILT/THE CONTRAST/a1.png",
      "/projects_/UNBUILT/THE CONTRAST/a2.png",
      "/projects_/UNBUILT/THE CONTRAST/a3.png",
      "/projects_/UNBUILT/THE CONTRAST/a4.png"
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
    heroImage: "/projects_/UNBUILT/THE TILT/4.png",
    gallery: [
      "/projects_/UNBUILT/THE TILT/4.png",
      "/projects_/UNBUILT/THE TILT/6.png",
      "/projects_/UNBUILT/THE TILT/16.png",
      "/projects_/UNBUILT/THE TILT/18.png",
      "/projects_/UNBUILT/THE TILT/Enscape_2025-08-15-20-26-10.jpg"
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
