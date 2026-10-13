# Nexa.ai — AI-Powered Content Creation Platform

> A full-stack AI SaaS application that lets authenticated users generate articles, blog titles, images, and more — all from a single, clean dashboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Environment Variables](#environment-variables)
8. [Running Locally](#running-locally)
9. [API Routes](#api-routes)
10. [Usage Notes](#usage-notes)

---

## Project Overview

Nexa.ai (formerly Quick.ai) is a full-stack AI SaaS platform built as a final-year B.Tech CSE project. It integrates multiple AI services behind a single authenticated interface, enabling users to create written content, generate and edit images, and review documents — with all creations saved to a personal dashboard and optionally shared with the community.

Authentication and subscription tiers are managed by **Clerk**, content is persisted in a serverless **Neon PostgreSQL** database, and generated images are stored on **Cloudinary**.

---

## Key Features

| Feature | Description |
|---|---|
| **AI Article Generation** | Generate long-form articles on any topic using Google Gemini |
| **Blog Title Generation** | Produce creative, numbered blog title suggestions via Gemini |
| **AI Image Generation** | Generate images from text prompts via Pollinations AI, stored on Cloudinary |
| **Image Background Removal** | Remove image backgrounds on the server using `@imgly/background-removal-node` |
| **Image Object Removal** | Remove specific objects from images using Cloudinary's generative AI transformation |
| **AI Resume Review** | Upload a PDF resume and receive structured AI feedback |
| **User Dashboard** | View all saved creations (articles, titles, images, resume reviews) in one place |
| **Community Gallery** | Browse publicly shared AI-generated images; like and unlike posts from other users |

> **Free-tier users** are limited to **10 AI requests** across text-based features. Premium features (image generation, background removal, object removal, and resume review) require an active Clerk premium plan.

---

## Tech Stack

### Frontend (`client/`)

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool and dev server |
| Tailwind CSS v4 | 4.x | Utility-first styling (via `@tailwindcss/vite` plugin) |
| React Router DOM | 7 | Client-side routing |
| Clerk React | 5/6 | Authentication UI and session management |
| Axios | 1.x | HTTP client |
| React Markdown | 10 | Render AI-generated markdown content |
| React Hot Toast | 2 | Toast notifications |
| Lucide React | 1.x | Icon library |

### Backend (`server/`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | >= 18 | Runtime (ESM `"type": "module"`) |
| Express | 5 | HTTP server and routing |
| Clerk Express | 2 | Server-side authentication middleware |
| Neon Serverless | 1 | Serverless PostgreSQL client |
| OpenAI SDK | 6 | Gemini API access via OpenAI-compatible endpoint |
| Cloudinary | 2 | Image upload, storage, and AI transformations |
| `@imgly/background-removal-node` | 1 | Server-side AI background removal |
| Multer | 2 | Multipart file uploads (images, PDFs) |
| pdf-parse | 2 | Extract text from uploaded PDF resumes |
| dotenv | 17 | Environment variable loading |
| nodemon | 3 | Auto-restart during development |

---

## Project Structure

```
Nexa.ai/
├── client/                        # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Static assets and shared data
│   │   ├── components/            # Reusable UI components
│   │   │   ├── AiTools.jsx        # AI tool cards on the landing page
│   │   │   ├── CreationItem.jsx   # Single creation card
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Plan.jsx           # Clerk pricing table widget
│   │   │   ├── Sidebar.jsx        # Dashboard navigation sidebar
│   │   │   └── Testimonial.jsx
│   │   ├── pages/
│   │   │   ├── home.jsx           # Public landing page
│   │   │   ├── layout.jsx         # Authenticated app shell with sidebar
│   │   │   ├── dashboard.jsx      # User's saved creations overview
│   │   │   ├── WriteArticle.jsx
│   │   │   ├── BlogTitles.jsx
│   │   │   ├── GenerateImages.jsx
│   │   │   ├── RemoveBackground.jsx
│   │   │   ├── RemoveObject.jsx
│   │   │   ├── ReviewResume.jsx
│   │   │   └── community.jsx      # Public gallery with likes
│   │   ├── App.jsx                # Route definitions
│   │   ├── main.jsx               # Entry point, ClerkProvider setup
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── server/                        # Node.js + Express backend
│   ├── config/
│   │   ├── cloudinary.js          # Cloudinary SDK initialisation
│   │   ├── db.js                  # Neon PostgreSQL connection
│   │   └── multer.js              # File upload configuration
│   ├── controllers/
│   │   ├── aiController.js        # All AI feature handlers
│   │   └── userController.js      # Dashboard and community handlers
│   ├── middlewares/
│   │   └── auth.js                # Clerk auth + plan/usage injection
│   ├── routes/
│   │   ├── aiRoutes.js            # /api/ai/* endpoints
│   │   └── userRoutes.js          # /api/user/* endpoints
│   ├── server.js                  # Express app entry point
│   └── package.json
│
├── .gitignore
├── package.json                   # Root-level shared dependencies
└── README.md
```

---

## Prerequisites

Before running the project locally, ensure you have the following accounts and tools:

- **Node.js** >= 18 and **npm** >= 9
- A **[Clerk](https://clerk.com)** account — for authentication and subscription plans
- A **[Neon](https://neon.tech)** account — for a serverless PostgreSQL database
- A **[Google AI Studio](https://aistudio.google.com)** account — for a Gemini API key
- A **[Cloudinary](https://cloudinary.com)** account — for image storage and transformations

---

## Installation

Clone the repository and install dependencies for both the frontend and backend.

```bash
# 1. Clone the repository
git clone https://github.com/Diti27/Nexa.ai.git
cd Nexa.ai

# 2. Install frontend dependencies
cd client
npm install

# 3. Install backend dependencies
cd ../server
npm install
```

---

## Environment Variables

Both applications are configured entirely through `.env` files. **Never commit these files** — they are excluded by `.gitignore`.

### Frontend — `client/.env`

Create a file at `client/.env` with the following variables:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASE_URL=http://localhost:3000
```

- **`VITE_CLERK_PUBLISHABLE_KEY`** — Get this from the **Clerk Dashboard → API Keys** section. It begins with `pk_test_` or `pk_live_`.
- **`VITE_BASE_URL`** — The base URL of your running backend. Every client page sets `axios.defaults.baseURL` from this variable at module load time. Use `http://localhost:3000` for local development. If your backend runs on a different port, update this value accordingly.

### Backend — `server/.env`

Create a file at `server/.env` with the following variables:

```env
# Neon PostgreSQL
DATABASE_URL=your_neon_postgresql_connection_string

# Clerk (server-side)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini (via OpenAI-compatible endpoint)
GEMINI_API_KEY=your_gemini_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Optional — Pollinations AI authentication (no key required for public use)
# POLLINATIONS_API_KEY=your_pollinations_api_key

# Optional — defaults to 3000
PORT=3000
```

Where to find each value:

| Variable | Source |
|---|---|
| `DATABASE_URL` | Neon Console → your project → Connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `GEMINI_API_KEY` | Google AI Studio → Get API Key |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Settings |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → Settings → API Keys |
| `POLLINATIONS_API_KEY` | Pollinations AI — optional; used to attach a Bearer token to image generation requests. Omit entirely for keyless public access. |

### Database Setup

Before running the backend for the first time, create the `creations` table in your Neon database using the Neon SQL editor or any PostgreSQL client:

```sql
CREATE TABLE IF NOT EXISTS creations (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  prompt      TEXT,
  content     TEXT,
  type        TEXT,
  publish     BOOLEAN     DEFAULT false,
  likes       TEXT[]      DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Running Locally

Open **two terminal windows** — one for the frontend and one for the backend.

### Start the Backend

```bash
cd server
npm run server   # nodemon — auto-restarts on file changes (recommended for dev)
# or
npm start        # plain node — no auto-restart
```

The server starts on `http://localhost:3000` by default (configurable via `PORT` in `server/.env`).

### Start the Frontend

```bash
cd client
npm run dev
```

Vite starts the dev server, typically at `http://localhost:5173`. Open that URL in your browser.

> **Note:** All API calls are routed through `axios.defaults.baseURL`, which is set from `VITE_BASE_URL` in `client/.env`. If your backend runs on a port other than `3000`, update `VITE_BASE_URL` in that file and restart the Vite dev server.

---

## API Routes

All backend routes require a valid Clerk session token sent as a `Bearer` token in the `Authorization` header.

### AI Routes — `/api/ai`

| Method | Endpoint | Body / Upload | Plan Required |
|---|---|---|---|
| POST | `/generate-article` | JSON: `{ prompt, length }` — `length` is the target word count (integer) | Free (up to 10 total requests) |
| POST | `/generate-blog-title` | JSON: `{ prompt }` | Free (up to 10 total requests) |
| POST | `/generate-image` | JSON: `{ prompt, publish }` — `publish` (boolean) controls community visibility | Premium only |
| POST | `/remove-image-background` | Multipart: `image` (file, any image format) | Premium only |
| POST | `/remove-image-object` | Multipart: `image` (file) + JSON: `{ object }` — name of the object to remove | Premium only |
| POST | `/review-resume` | Multipart: `resume` (PDF file, max **5 MB**) | Premium only |

### User Routes — `/api/user`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/get-user-creations` | Fetch all creations for the authenticated user |
| GET | `/get-published-creations` | Fetch all publicly published creations |
| POST | `/toggle-like-creation` | Like or unlike a published creation |

---

## Usage Notes

- **Free-tier limit:** Free users can make up to **10 AI requests** across article generation and blog title generation. The counter is stored in Clerk private user metadata (`free_usage`). Once the limit is reached, the user must upgrade to a premium Clerk plan to continue.
- **Premium gating:** Image generation, background removal, object removal, and resume review are restricted to premium plan subscribers. Access is enforced server-side via Clerk's `has({ plan: "premium" })` check — it cannot be bypassed on the client.
- **AI service availability:** Google Gemini and Pollinations AI are third-party services. Response quality, latency, and availability are subject to their respective terms of service and rate limits. Ensure your Gemini API key has sufficient quota before use.
- **File uploads:** Image and PDF uploads are handled by Multer with disk storage. Uploaded files are deleted from the server's temp directory after each request (via `finally` blocks). PDF resumes are subject to a **5 MB maximum file size**, enforced server-side.
- **Community Gallery:** Only AI-generated images with `publish: true` are displayed in the gallery. Other creation types (articles, blog titles, resume reviews) are always private and do not appear in the community feed.
- **Pollinations AI:** Image generation uses the public Pollinations AI API (no key required). If `POLLINATIONS_API_KEY` is set in `server/.env`, it is sent as a Bearer token for authenticated access, but the service is fully functional without it.
- **CORS:** The backend currently allows all origins (`cors()` with defaults). For a production deployment, restrict this to your actual frontend origin.

---

## Acknowledgements

- [Clerk](https://clerk.com) — Authentication and subscription management
- [Neon](https://neon.tech) — Serverless PostgreSQL
- [Google Gemini](https://ai.google.dev) — Large language model API
- [Pollinations AI](https://pollinations.ai) — Open-source image generation
- [Cloudinary](https://cloudinary.com) — Image storage and AI-powered transformations
- [@imgly/background-removal-node](https://github.com/imgly/background-removal-node) — Server-side background removal
