// Staged asset preloading for the boot sequence.
//
//  Stage 1 – preloadCritical(): runs behind the block-stacking game (BootLoader).
//            Intro video, both GLB models, the home 3D chunk and the home images.
//  Stage 2 – preloadProjects(): starts once the intro video is playing.
//            Every project image + the projects page / 3D scene chunks.
//
// Kept free of three.js / sanity static imports so it doesn't bloat the
// layout-level bundle that has to hydrate before the intro can start.

export type LoadGroup = "film" | "models" | "images";
export type GroupProgress = Record<LoadGroup, number>;

export interface BootApi {
  setProgress: (p: number, groups?: GroupProgress) => void;
  setReady: () => void;
  onEnter: (cb: () => void) => void;
  hide: (instant?: boolean) => void;
}

declare global {
  interface Window {
    __boot?: BootApi;
    introComplete?: boolean;
  }
}

export const INTRO_VIDEO = "/intro.mp4";
export const MODEL_PATHS = [
  "/models/modern_luxury_villa_house_building_home.glb",
  "/models/nft_3d_art_gallery_-_luciano_robur.glb",
];

const CRITICAL_TIMEOUT_MS = 20000;

// Holds decoded images so the browser keeps them in its memory cache.
const retained: HTMLImageElement[] = [];

function loadImage(url: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      retained.push(img);
      img.decode().catch(() => {}).finally(resolve);
    };
    img.onerror = () => resolve();
    img.src = url;
  });
}

/** Fetch a URL fully, reporting 0..1 progress. Resolves with the body as a Blob. */
async function fetchWithProgress(url: string, onProgress: (p: number) => void): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  const total = Number(res.headers.get("content-length")) || 0;
  if (!res.body || !total) {
    const blob = await res.blob();
    onProgress(1);
    return blob;
  }
  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(Math.min(received / total, 1));
  }
  onProgress(1);
  return new Blob(chunks, { type: res.headers.get("content-type") || undefined });
}

let criticalPromise: Promise<{ videoUrl: string }> | null = null;

/**
 * Loads everything the first screen needs. Memoised, so React strict-mode double
 * effects don't download twice. Never rejects; resolves after at most ~20s.
 */
export function preloadCritical(
  onProgress: (p: number, groups: GroupProgress) => void
): Promise<{ videoUrl: string }> {
  if (criticalPromise) return criticalPromise;

  // Weighted progress: big binary files count more than images.
  const parts: { weight: number; p: number; group: LoadGroup }[] = [];
  const ratio = (list: typeof parts) => {
    const total = list.reduce((s, x) => s + x.weight, 0);
    return total ? list.reduce((s, x) => s + x.weight * x.p, 0) / total : 1;
  };
  const track = (weight: number, group: LoadGroup) => {
    const part = { weight, p: 0, group };
    parts.push(part);
    return (p: number) => {
      part.p = p;
      const byGroup = (g: LoadGroup) => ratio(parts.filter((x) => x.group === g));
      onProgress(ratio(parts), { film: byGroup("film"), models: byGroup("models"), images: byGroup("images") });
    };
  };

  let videoUrl = INTRO_VIDEO;

  const videoReport = track(3, "film");
  const video = fetchWithProgress(INTRO_VIDEO, videoReport)
    .then((blob) => { videoUrl = URL.createObjectURL(blob); })
    .catch(() => videoReport(1));

  const models = MODEL_PATHS.map((url, i) => {
    const report = track(i === 0 ? 4 : 2, "models");
    return fetchWithProgress(url, report).then(() => {}, () => report(1));
  });

  // Home 3D chunk: importing it also runs useGLTF.preload for the villa model.
  const chunkReport = track(1, "models");
  const heroChunk = import("@/components/three/HeroCanvas").then(
    () => chunkReport(1),
    () => chunkReport(1)
  );

  const imagesReport = track(2, "images");
  const images = import("@/config/sanity").then(({ MOCK_PROJECTS }) => {
    const urls = ["/n3.png", ...MOCK_PROJECTS.slice(0, 3).map((p) => p.heroImage).filter(Boolean)];
    let done = 0;
    return Promise.all(
      urls.map((u) => loadImage(u).then(() => imagesReport(++done / urls.length)))
    );
  }, () => imagesReport(1));

  const all = Promise.all([video, ...models, heroChunk, images]).then(() => ({ videoUrl }));
  const timeout = new Promise<{ videoUrl: string }>((resolve) =>
    setTimeout(() => resolve({ videoUrl }), CRITICAL_TIMEOUT_MS)
  );

  criticalPromise = Promise.race([all, timeout]);
  return criticalPromise;
}

let projectsStarted = false;

/** Background-load the projects page while the intro video plays. Fire-and-forget. */
export function preloadProjects(prefetchRoute?: (href: string) => void) {
  if (projectsStarted) return;
  projectsStarted = true;

  prefetchRoute?.("/projects");
  import("@/components/three/ProjectsLobbyScene").catch(() => {});
  import("@/components/three/VirtualGalleryHall").catch(() => {});

  import("@/config/sanity").then(({ MOCK_PROJECTS }) => {
    const urls = Array.from(
      new Set(MOCK_PROJECTS.flatMap((p) => [p.heroImage, ...(p.gallery || [])]).filter(Boolean))
    );
    // Low concurrency so the playing video and the home page stay smooth.
    let next = 0;
    const worker = async () => {
      while (next < urls.length) await loadImage(urls[next++]);
    };
    Promise.all([worker(), worker(), worker()]);
  }).catch(() => {});
}
