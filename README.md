# 🏛️ Noyyal Studio — Architecture & Spatial Research Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=flat-square&logo=three.js)](https://threejs.org/)
[![Sanity CMS](https://img.shields.io/badge/Sanity-CMS-F03E2F?style=flat-square&logo=sanity)](https://www.sanity.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com/)

A modern, high-performance web platform designed for **Noyyal Studio** — an architectural design and spatial research studio. The application combines interactive WebGL 3D massing visualizers, interactive architectural blueprint drafting canvases, Sanity CMS integration, smooth kinetic typography, and a multi-channel client inquiry system.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Tech Stack & Architecture](#-tech-stack--architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [Page Routes & API Endpoints](#-page-routes--api-endpoints)
- [CI/CD & Deployment](#-cicd--deployment)
- [License](#-license)

---

## ✨ Key Features

- 🧊 **Interactive 3D Structural Canvas**: Low-poly WebGL architectural 3D building visualizer with `OrbitControls` built using `@react-three/fiber` and `@react-three/drei`.
- 📐 **Blueprint & Ink Canvases**: Interactive SVG grid overlays, schematic anatomy diagrams, and HTML5 canvas ink drawing tools (`InteractiveArchitecturalCanvas`, `InkCanvas`, `ArchitecturalAnatomyDiagram`).
- 📂 **Sanity Headless CMS Integration**: Live CMS integration for architectural project showcases, research papers, and behind-the-scenes documentation, backed by robust fallback datasets for offline development.
- ⚡ **Kinetic Motion & Smooth Scroll**: Lenis smooth inertial scrolling combined with GSAP entrance timelines and Framer Motion micro-interactions.
- 🎨 **Architectural Grid Design System**: Clean monochrome technical grid aesthetics featuring crosshairs, subtle dot-matrix patterns, and custom Syne typography.
- 📩 **Dual-Channel Inquiry Pipeline**: Contact endpoint (`/api/contact`) supporting atomic persistence in **Firebase Firestore** alongside automated email notifications via **Resend API**.
- 🛠️ **Automated CI/CD Pipeline**: GitHub Actions workflow verifying TypeScript compilation (`tsc --noEmit`), ESLint compliance, and Next.js production builds on every commit.

---

## 🛠 Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (App Router) | React Server Components, client-side dynamic imports, and API routes |
| **UI Library** | React 19 | Component-driven UI rendering |
| **Language** | TypeScript 5 | End-to-end static typing |
| **Styling** | Tailwind CSS v4 + Custom Utilities | Minimalist architectural dot-grid tokens and responsive layouts |
| **3D Rendering** | Three.js + R3F + Drei | Dynamic 3D massing scene (`HeroCanvas`, `InteractiveBuilding`) |
| **Animations** | GSAP 3 + Framer Motion | Timeline-orchestrated entrance animations & micro-interactions |
| **Smooth Scroll** | Lenis | Inertial smooth scroll behavior |
| **Content Management** | Sanity CMS | Headless CMS client (`next-sanity`) with dynamic image optimization |
| **Database & API** | Firebase Firestore + Resend | Serverless database for inquiries & transactional email dispatch |
| **Hosting & CI** | Vercel + GitHub Actions | Automated linting, type-checking, build validation, and edge hosting |

---

## 📂 Project Structure

```text
noyyal/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow (Node 22, tsc, lint, build)
├── public/                      # Static assets, fonts, icons
├── src/
│   ├── app/                     # Next.js App Router pages & API routes
│   │   ├── about/               # About page route
│   │   ├── about-us/            # Extended About Us page with Architectural Diagram
│   │   ├── api/
│   │   │   └── contact/         # Contact form POST API handler (Firebase + Resend)
│   │   ├── bts/                 # Behind the Scenes showcase route
│   │   ├── contact/             # Contact page with inquiry form
│   │   ├── projects/            # Architectural projects gallery route
│   │   ├── research/            # Publications & spatial research route
│   │   ├── globals.css          # Global CSS & Tailwind configuration
│   │   ├── layout.tsx           # Global root layout (Fonts, Lenis, IntroLoader)
│   │   └── page.tsx             # Main Landing / Hero page
│   ├── components/
│   │   ├── three/               # Three.js 3D canvas components
│   │   │   ├── HeroCanvas.tsx
│   │   │   └── InteractiveBuilding.tsx
│   │   └── ui/                  # UI components
│   │       ├── ArchitecturalAnatomyDiagram.tsx
│   │       ├── CustomCursor.tsx
│   │       ├── Footer.tsx
│   │       ├── InkCanvas.tsx
│   │       ├── InteractiveArchitecturalCanvas.tsx
│   │       ├── IntroLoader.tsx
│   │       ├── IntroWrapper.tsx
│   │       ├── Navigation.tsx
│   │       └── SmoothScroll.tsx
│   └── config/                  # Third-party integrations
│       ├── firebase.ts          # Firebase SDK initialization & Firestore instance
│       └── sanity.ts            # Sanity client & mock dataset fallbacks
├── eslint.config.mjs            # ESLint configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Project dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── vercel.json                  # Vercel deployment configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or `v22.x` recommended
- **Package Manager**: `npm` (v10+), `pnpm`, or `bun`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sanjay1744/noyyal_studio.git
   cd noyyal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables** *(Optional for local development; fallbacks are enabled)*:
   Create a `.env.local` file in the project root (see [Environment Variables](#-environment-variables)).

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🔑 Environment Variables

The project operates with built-in mock fallbacks when API keys are omitted. To connect real Sanity CMS, Firebase, and Resend credentials, create a `.env.local` file:

```env
# Sanity CMS Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Firebase Firestore Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Resend Email API
RESEND_API_KEY=re_123456789
```

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Next.js app in development mode on `http://localhost:3000` |
| `npm run build` | Compiles and builds the production application |
| `npm run start` | Starts the production server after building |
| `npm run lint` | Runs ESLint to check for code quality and style issues |
| `npx tsc --noEmit` | Runs the TypeScript compiler to verify type correctness |

---

## 🗺 Page Routes & API Endpoints

- `/` — Main Landing Page featuring 3D structural canvas, studio overview, key stats, and featured projects.
- `/about-us` — Interactive architectural anatomy blueprint, methodology, team details, and studio ethos (redirects from `/about`).
- `/projects` — Portfolio gallery of residential, commercial, interior, and unbuilt projects.
- `/research` — Architectural research papers, spatial investigations, and publications index.
- `/bts` — Behind the scenes process breakdown and studio draft archives.
- `/contact` — Interactive contact form with live validation.
- `/api/contact` — `POST` endpoint receiving user messages, storing them in Firebase, and dispatching notification emails via Resend.

---

## 🚢 CI/CD & Deployment

### Continuous Integration (GitHub Actions)
Every `push` or `pull_request` to `main` or `master` triggers `.github/workflows/ci.yml`, executing:
1. Node.js environment setup (v22 with npm caching).
2. Clean dependency installation (`npm ci`).
3. Static type validation (`npx tsc --noEmit`).
4. ESLint verification (`npm run lint`).
5. Production bundle build (`npm run build`).

### Deployment (Vercel)
The application is pre-configured for seamless deployment on **Vercel** via `vercel.json` targeting the Singapore (`sin1`) edge region.

---

## 📄 License

This repository is maintained for **Noyyal Studio**. All rights reserved.
