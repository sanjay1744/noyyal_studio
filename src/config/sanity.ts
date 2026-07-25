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
export interface Project {
  num: string;
  name: string;
  type: string;
  year: string;
  location: string;
  status: "built" | "ongoing" | "study";
  area: string;
  program: string;
  desc: string;
  tags: string[];
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
    type: "Residential",
    year: "2023",
    location: "Coimbatore, Tamil Nadu",
    status: "built",
    area: "280 sqm",
    program: "Single family residence",
    desc: "A home carved into a laterite slope, mediating between the hillside and the valley below. The section defines three levels of inhabitation — each opening differently to the landscape.",
    tags: ["Slope", "Laterite", "Section", "Landscape"]
  },
  {
    num: "NS — 002",
    name: "River Bend Residence",
    type: "Residential",
    year: "2022",
    location: "Palakkad, Kerala",
    status: "built",
    area: "340 sqm",
    program: "Family home",
    desc: "Sited on the bend of a seasonal river. The house is oriented around a central courtyard that frames the sound of water while protecting against monsoon flooding through a raised plinth.",
    tags: ["Courtyard", "Water", "Monsoon", "Kerala"]
  },
  {
    num: "NS — 003",
    name: "Threshold House",
    type: "Residential",
    year: "2024",
    location: "Chennai, Tamil Nadu",
    status: "ongoing",
    area: "210 sqm",
    program: "Urban residence",
    desc: "A study in arrival — the house contains three distinct threshold moments before the primary living space. An urban house that borrows the logic of the traditional Tamil verandah.",
    tags: ["Threshold", "Urban", "Verandah", "Sequence"]
  },
  {
    num: "NS — 004",
    name: "Courtyard Research Home",
    type: "Research",
    year: "2023",
    location: "Madurai, Tamil Nadu",
    status: "study",
    area: "—",
    program: "Research project",
    desc: "A speculative design exploring how the traditional agraharam courtyard typology can be re-interpreted for contemporary nuclear families. Published in the studio's research journal.",
    tags: ["Courtyard", "Agraharam", "Speculative", "Typology"]
  },
  {
    num: "NS — 005",
    name: "Weekend Retreat",
    type: "Residential",
    year: "2021",
    location: "Kodaikanal, Tamil Nadu",
    status: "built",
    area: "160 sqm",
    program: "Holiday home",
    desc: "A small home in the Palani Hills — built almost entirely from locally quarried granite. The structure sits lightly on the land, organized around a single long view towards the valley.",
    tags: ["Granite", "Hills", "Compact", "View"]
  },
  {
    num: "NS — 006",
    name: "Urban Infill Study",
    type: "Research",
    year: "2024",
    location: "Chennai, Tamil Nadu",
    status: "study",
    area: "—",
    program: "Urban research",
    desc: "An ongoing study mapping residential infill conditions across three Chennai neighbourhoods. Documents how buildings negotiate between party walls, setbacks, and light.",
    tags: ["Urban", "Infill", "Chennai", "Mapping"]
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
