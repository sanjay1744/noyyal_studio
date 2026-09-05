import * as THREE from "three";
import { Project } from "@/config/sanity";

// Cache for loaded HTMLImageElement instances to eliminate reloading flicker
const imageCache: Map<string, HTMLImageElement> = new Map();

export function getOrLoadImage(url: string, onLoad: () => void): HTMLImageElement | null {
  if (!url) return null;

  if (imageCache.has(url)) {
    const img = imageCache.get(url)!;
    if (img.complete && img.naturalWidth !== 0) return img;
  }

  const img = new Image();
  if (url.startsWith("http://") || url.startsWith("https://")) {
    img.crossOrigin = "anonymous";
  }
  img.src = url;
  img.onload = () => {
    imageCache.set(url, img);
    onLoad();
  };
  img.onerror = () => {
    console.warn(`Failed to load image for 3D texture: ${url}`);
  };
  return null;
}

export function createFrameTexture(
  project: Project,
  imageIndex: number,
  onImageLoaded?: () => void,
  isFocused: boolean = false
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  // 1024x1024 resolution for ultra crisp architectural renders
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  // Get gallery image URL - heroImage is always index 0 (primary image)
  const galleryImages = project.heroImage
    ? [project.heroImage, ...(project.gallery || []).filter((img) => img !== project.heroImage)]
    : project.gallery && project.gallery.length > 0
    ? project.gallery
    : [];
  const safeIdx = galleryImages.length > 0 ? Math.abs(imageIndex) % galleryImages.length : 0;
  const currentImageUrl = galleryImages[safeIdx] || project.heroImage;

  const renderCanvas = (img: HTMLImageElement | null) => {
    // Background: Deep luxurious studio dark
    ctx.fillStyle = "#0c0d0e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border / Matte Board
    const margin = 32;
    const innerWidth = canvas.width - margin * 2;
    const innerHeight = canvas.height - margin * 2;

    // Thin architectural matte frame
    ctx.strokeStyle = isFocused ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 4;
    ctx.strokeRect(margin, margin, innerWidth, innerHeight);

    // Draw artwork image if complete & loaded
    if (img && img.complete && img.naturalWidth !== 0) {
      const imgAspect = img.width / img.height;
      let drawW = innerWidth;
      let drawH = innerWidth / imgAspect;

      if (drawH > innerHeight - 120) {
        drawH = innerHeight - 120;
        drawW = drawH * imgAspect;
      }

      const drawX = margin + (innerWidth - drawW) / 2;
      const drawY = margin + ((innerHeight - 120) - drawH) / 2;

      // Subtle drop shadow for artwork
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
    } else {
      // Placeholder while image is downloading
      ctx.fillStyle = "#16181a";
      ctx.fillRect(margin + 16, margin + 16, innerWidth - 32, innerHeight - 150);
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.font = "500 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("LOADING ARCHITECTURAL FRAME...", canvas.width / 2, canvas.height / 2 - 40);
    }

    // --- Museum Info Plaque Section at Bottom ---
    const plaqueY = canvas.height - margin - 110;
    
    // Subtle divider line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(margin + 20, plaqueY);
    ctx.lineTo(canvas.width - margin - 20, plaqueY);
    ctx.stroke();

    // Project Number / Category Tag (Left)
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "600 20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${project.num || "NS"} — ${project.category.toUpperCase()}`, margin + 30, plaqueY + 40);

    // Project Title (Left)
    ctx.fillStyle = "#f3f4f6";
    ctx.font = "600 32px sans-serif";
    const titleText = project.name.length > 28 ? project.name.slice(0, 26) + "..." : project.name;
    ctx.fillText(titleText, margin + 30, plaqueY + 80);

    // Image Counter / Navigation Indicator (Right)
    const totalImgs = galleryImages.length;
    ctx.fillStyle = isFocused ? "#ffffff" : "rgba(255, 255, 255, 0.6)";
    ctx.font = "600 22px monospace";
    ctx.textAlign = "right";
    ctx.fillText(`FRAME [${safeIdx + 1}/${totalImgs}]`, canvas.width - margin - 30, plaqueY + 40);

    // Year & Location (Right)
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "400 20px sans-serif";
    ctx.fillText(`${project.location} · ${project.year}`, canvas.width - margin - 30, plaqueY + 80);

    // Focus Indicator Badge if selected
    if (isFocused) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(margin, margin, 12, 12);
      ctx.fillRect(canvas.width - margin - 12, margin, 12, 12);
      ctx.fillRect(margin, canvas.height - margin - 12, 12, 12);
      ctx.fillRect(canvas.width - margin - 12, canvas.height - margin - 12, 12, 12);
    }

    texture.needsUpdate = true;
  };

  const initialImg = getOrLoadImage(currentImageUrl, () => {
    // When image finishes loading asynchronously, redraw canvas & trigger WebGL texture update automatically!
    const loadedImg = imageCache.get(currentImageUrl) || null;
    renderCanvas(loadedImg);
    if (onImageLoaded) onImageLoaded();
  });

  // Initial draw
  renderCanvas(initialImg);

  return texture;
}

export function createComingSoonTexture(
  category: string,
  isFocused: boolean = false
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // Deep minimalist studio background
  ctx.fillStyle = "#090a0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const margin = 32;
  const innerWidth = canvas.width - margin * 2;
  const innerHeight = canvas.height - margin * 2;

  // Thin architectural matte frame
  ctx.strokeStyle = isFocused ? "rgba(245, 158, 11, 0.6)" : "rgba(255, 255, 255, 0.12)";
  ctx.lineWidth = 4;
  ctx.strokeRect(margin, margin, innerWidth, innerHeight);

  // Subtle architectural grid background inside artwork area
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1.5;
  const gridSize = 64;
  for (let x = margin; x <= canvas.width - margin; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, canvas.height - margin - 120);
    ctx.stroke();
  }
  for (let y = margin; y <= canvas.height - margin - 120; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    ctx.stroke();
  }

  // Centered Museum Poster Text
  const centerY = (canvas.height - 120) / 2;

  // Tag line
  ctx.fillStyle = "rgba(245, 158, 11, 0.85)";
  ctx.font = "600 22px monospace";
  ctx.textAlign = "center";
  ctx.fillText(`NOYYAL STUDIO · ${category.toUpperCase()} ARCHIVE`, canvas.width / 2, centerY - 70);

  // Main Headline
  ctx.fillStyle = "#f3f4f6";
  ctx.font = "700 48px sans-serif";
  ctx.fillText("COMING SOON", canvas.width / 2, centerY);

  // Subtitle
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "400 24px sans-serif";
  ctx.fillText("Upcoming Project / Research Monograph", canvas.width / 2, centerY + 55);

  // Bottom Plaque Section
  const plaqueY = canvas.height - margin - 110;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(margin + 20, plaqueY);
  ctx.lineTo(canvas.width - margin - 20, plaqueY);
  ctx.stroke();

  // Bottom plaque text
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.font = "500 20px monospace";
  ctx.textAlign = "left";
  ctx.fillText("NS — UPCOMING EXHIBITION FRAME", margin + 30, plaqueY + 50);

  ctx.textAlign = "right";
  ctx.fillText("STATUS: IN DESIGN", canvas.width - margin - 30, plaqueY + 50);

  if (isFocused) {
    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(margin, margin, 12, 12);
    ctx.fillRect(canvas.width - margin - 12, margin, 12, 12);
    ctx.fillRect(margin, canvas.height - margin - 12, 12, 12);
    ctx.fillRect(canvas.width - margin - 12, canvas.height - margin - 12, 12, 12);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return texture;
}
