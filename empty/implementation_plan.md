# Implementation Plan: Noyyal Studios — Premium Portfolio & Research Website

This document outlines the architecture, setup process, and implementation roadmap to build a premium, highly interactive portfolio and research website for **Noyyal Studios** using **Next.js 15**, **Tailwind CSS**, **GSAP**, **React Three Fiber (Three.js)**, **Sanity CMS**, **Firebase**, **Resend**, and **Cloudinary**.

---

## User Review Required

Please review the following key decisions and setup configurations before we begin development:

> [!IMPORTANT]
> **1. Sanity CMS vs. Firestore for Content Management**
> We recommend using **Sanity CMS** for dynamic content (Projects, Blogs, Team, Research) because it provides a rich editor interface (Sanity Studio) for the client. Firestore will be reserved for transactional data (Contact Form submissions/Enquiries). Let us know if you prefer a purely Firestore-driven database instead.
>
> **2. Third-Party Credentials**
> To complete the setup, we will need placeholder environment variables configured. You will need to provision:
> - **Firebase Project**: Configuration keys (API Key, Project ID, etc.).
> - **Sanity Project ID & Dataset**: For the content schemas.
> - **Cloudinary Cloud Name & Upload Preset**: For image asset hosting and automatic optimization.
> - **Resend API Key**: For email dispatch from the contact page.
>
> **3. 3D Architectural Model**
> We plan to add an interactive 3D site plan / abstract building model on the Home page hero section using **React Three Fiber**. This will replace the static 2D SVG floor plan sketch from the HTML mockup with a real-time, interactive, rotating architectural wireframe or low-poly model that morphs as the user scrolls.

---

## Open Questions

- **Do you already have accounts set up for Sanity, Firebase, Cloudinary, and Resend?**
  *If yes, we can configure the `.env.local` file directly. If not, we will configure the project with mock variables/local mode so it can run immediately, and you can add credentials later.*
- **Should the contact form send email notifications to a specific address?**
  *We will set up Resend to forward contact messages to `studio@noyyal.studio` (or a custom email address of your choice).*

---

## Architecture & Project Structure

The project will use **Next.js 15** with the **App Router** and **TypeScript** for SEO and speed.

```
noyyal-studios/
├── public/                 # Static assets (3D GLTF models, logos)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # Main layout (Smooth scrolling context, custom cursor)
│   │   ├── page.tsx        # Home / Index Page (Hero, Selected Projects, statement)
│   │   ├── projects/       # Projects list & project detail pages (ISR/Dynamic)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── research/       # Research articles & publications
│   │   │   └── page.tsx
│   │   ├── studio/         # About page (Principles, profiles)
│   │   │   └── page.tsx
│   │   ├── contact/        # Contact form page
│   │   │   └── page.tsx
│   │   └── api/
│   │       └── contact/    # API Route for handling form submissions (Resend)
│   │           └── route.ts
│   ├── components/         # Reusable UI Components
│   │   ├── three/          # 3D R3F components (InteractiveBuilding, CanvasContainer)
│   │   │   ├── InteractiveBuilding.tsx
│   │   │   └── HeroCanvas.tsx
│   │   ├── ui/             # Core UI components
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── Navigation.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── InkCanvas.tsx
│   │   └── animations/     # Transition wrappers / GSAP helpers
│   ├── config/             # Third-party integrations configs
│   │   ├── firebase.ts     # Firebase client setup
│   │   └── sanity.ts       # Sanity Client & image builder
│   ├── styles/
│   │   └── globals.css     # Tailwind CSS entry with base typography & variables
│   └── types/              # TypeScript type definitions
```

---

## Proposed Changes

We will build the application in modular phases, starting with framework initialization, followed by animation systems, content infrastructure, and premium visual components.

---

### Phase 1: Foundation & Styling System

#### [NEW] [package.json](file:///d:/freelancing/noyyal/package.json)
- Define standard Next.js 15 configurations.
- Include Tailwind CSS, TypeScript, and ESLint.
- Configure dependency versions matching the stack:
  ```json
  {
    "dependencies": {
      "next": "^15.0.0",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "gsap": "^3.12.5",
      "@studio-freight/lenis": "^1.0.42",
      "three": "^0.160.0",
      "@react-three/fiber": "^9.0.0",
      "@react-three/drei": "^9.100.0",
      "firebase": "^10.8.0",
      "next-sanity": "^9.0.0",
      "resend": "^3.2.0",
      "lucide-react": "^0.344.0",
      "framer-motion": "^11.0.8",
      "clsx": "^2.1.0",
      "tailwind-merge": "^2.2.1"
    }
  }
  ```

#### [NEW] [globals.css](file:///d:/freelancing/noyyal/src/styles/globals.css)
- Implement a premium, high-contrast typography system using modern Google fonts: **Syne** (for bold architectural headlines) and **DM Mono** (for technical data details) or **Inter**.
- Define variable tokens for architectural colors:
  - Background: Warm bone-white (`#F4F3EF` / `rgb(244, 243, 239)`)
  - Primary: Charcoal/Ebony (`#0C0C0C` / `rgb(12, 12, 12)`)
  - Muted elements: Concrete grey (`#888888`) and Light plaster (`#D8D6D0`)
- Setup custom utilities for smooth transitions and hide standard scrollbars.

---

### Phase 2: Core Layout & Cinematic Systems

#### [NEW] [CustomCursor.tsx](file:///d:/freelancing/noyyal/src/components/ui/CustomCursor.tsx)
- Recreate the custom cursor from the mockup.
- Mouse interaction: expand cursor circle on links, cards, buttons, and custom canvas areas.

#### [NEW] [InkCanvas.tsx](file:///d:/freelancing/noyyal/src/components/ui/InkCanvas.tsx)
- Port the high-performance HTML5 2D canvas ink-particles trailing effect.
- Render dynamic, slowly decaying ink strokes and dots tracing the cursor movement across the viewport.

#### [NEW] [layout.tsx](file:///d:/freelancing/noyyal/src/app/layout.tsx)
- Root layout initialization.
- Integrate **Lenis** smooth scroll context provider wrapping all pages.
- Mount global components: Navigation, Footer, CustomCursor, InkCanvas.

---

### Phase 3: Content Integration (Sanity & Firebase)

#### [NEW] [sanity.config.ts](file:///d:/freelancing/noyyal/sanity.config.ts) & [sanity.ts](file:///d:/freelancing/noyyal/src/config/sanity.ts)
- Configure connection to Sanity Project and export helper queries.
- Define dynamic project query schema to resolve details (location, area, status, year, image gallery, desc).

#### [NEW] [firebase.ts](file:///d:/freelancing/noyyal/src/config/firebase.ts)
- Initialize Firebase client using environment variables.
- Export `db` (Firestore instances) for recording client contact enquiries.

---

### Phase 4: 3D Visualization & Animations

#### [NEW] [HeroCanvas.tsx](file:///d:/freelancing/noyyal/src/components/three/HeroCanvas.tsx)
- High-performance, dynamically loaded Three.js Canvas container.
- Suspense loader showing a custom minimalistic placeholder until assets load.

#### [NEW] [InteractiveBuilding.tsx](file:///d:/freelancing/noyyal/src/components/three/InteractiveBuilding.tsx)
- Standard R3F component displaying an abstract 3D wireframe building model or structured floor plan study.
- Animate elements on scroll using GSAP ScrollTrigger to tie scroll depth to 3D rotation, camera zoom, or morph target deformation.

---

### Phase 5: Pages and Routing

#### [NEW] [page.tsx](file:///d:/freelancing/noyyal/src/app/page.tsx)
- Home page layout.
- Embed GSAP intro animation (Logo drawing + headline letters reveal).
- selected projects row fetching dynamic entries from Sanity CMS.

#### [NEW] [projects/page.tsx](file:///d:/freelancing/noyyal/src/app/projects/page.tsx)
- Detailed interactive project list.
- Dynamic sidebar filters (Residential / Research / Year / Status).
- Dynamic detail panels opening with high-end GSAP slide-in transitions.

#### [NEW] [contact/page.tsx](file:///d:/freelancing/noyyal/src/app/contact/page.tsx)
- Premium multi-step or single-column form matching the minimal branding.
- API endpoint integration: triggers Firestore save and fires emails using **Resend**.

---

## Verification Plan

We will perform automated and manual testing to ensure top-tier performance, visual fidelity, and functional correctness.

### Automated Verification
- **Linter & Type Checking**: Run `npm run lint` and `npx tsc --noEmit` to verify code consistency and type safety.
- **Production Compilation**: Run `npm run build` to confirm static export or ISR compilation passes.

### Manual Verification
- **Visual Auditing**: Inspect GSAP animations, custom cursors, and React Three Fiber 3D models across multiple viewport widths (mobile, tablet, desktop).
- **Smooth Scroll Assessment**: Test the scroll smoothness (Lenis) and ScrollTrigger synchronization on Safari, Chrome, and Firefox.
- **Integration Tests**:
  - Submit a test contact form, verify details write to Firestore database, and confirm receipt of notification email from Resend.
  - Add a draft project in Sanity CMS studio and verify instant updates in Next.js projects feed.
