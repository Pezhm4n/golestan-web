# Golestoon

> یک دستیار مدرن برای برنامه‌ریزی و مدیریت انتخاب واحد در سیستم گلستان  
> A modern assistant for planning and managing your courses in the Golestan system.

---

## Tech Stack

[![React](https://img.shields.io/badge/Frontend-React-%2361DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-%233178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-%23646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/UI-TailwindCSS-%2306B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/Design-shadcn%2Fui-%23000000)](https://ui.shadcn.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-%23339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Deployable-Docker-%232496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## Key Features

- 🚀 **Lightweight Backend**  
  Pure Node.js proxy — **no local Python, TensorFlow, or GPU** required. All heavy lifting has been moved to external services.

- 🤖 **AI Captcha Solving**  
  Captcha images from Golestan are sent to a **remote AI API** (by default a HuggingFace Space such as `golestan-captcha-solver`) with high accuracy and zero local ML setup.

- 📅 **Smart Schedule Builder**  
  - Interactive weekly grid  
  - Visual conflict detection (time & exam clashes)  
  - Exam schedule view with export (CSV/Excel) & print-friendly layout  
  - Support for custom “user-added” courses  

- 🔒 **Privacy-Oriented Backend**  
  - Node proxy keeps **no persistent database** of your Golestan data.  
  - Credentials are used to fetch your data and then discarded on the server side.  
  - Backend includes basic rate limiting and security headers.  

- 🌙 **Dark Mode & i18n**  
  - Full RTL/LTR support (Persian / English)  
  - Dark & light themes, user-selectable  
  - Text and layout tuned for Persian university workflows.  

---

## Architecture Overview

The new Golestoon architecture is intentionally lightweight and browser‑first:

```text
User Browser
    ↓
React SPA (Vite, Tailwind, shadcn/ui)
    ↓
Node.js Proxy (server/index.ts)
    ├── Simulates Golestan browser client (headers, cookies, ASP.NET flow)
    ├── Requests student data & course history from Golestan
    └── Sends captcha images to External Captcha API (HuggingFace Space)

External Systems:
    • Golestan Web System (university)
    • Captcha Solver API (e.g. golestan-captcha-solver on HuggingFace)
```

- The **React app** runs fully in the browser and talks only to the **Node proxy**.  
- The **Node proxy**:
  - Handles the brittle ASP.NET / cookie / headers logic.  
  - Calls the captcha solver API instead of running any local ML model.  
  - Never exposes Golestan internals directly to the browser.  

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js v18+** (recommended)  
- **npm** or **pnpm** or **yarn** (examples below use `npm`)

No Python, virtualenv, or TensorFlow is required for running Golestoon.

---

### 2. Clone & Install

```bash
# Clone the repository
git clone https://github.com/Pezhm4n/golestan-web.git
cd golestan-web

# Install dependencies
npm install
```

> Replace the Git URL with the actual repository URL you use.

---

### 3. Environment Setup (`.env` / environment variables)

The Node proxy (`server/index.ts`) is configured via environment variables.  
You can set them via a `.env` file (if you use something like `dotenv`) or via your process manager / hosting platform.

**Key variables:**

- `PORT`  
  - **Description:** Port for the Node proxy server.  
  - **Default:** `8000`  
  - **Example:** `PORT=8000`

- `HOST`  
  - **Description:** Host binding for the Node server.  
  - **Default:** `127.0.0.1` (binds only to localhost)  
  - **Note:** Set `HOST=0.0.0.0` **only** when running behind a trusted reverse proxy (e.g. Docker, Kubernetes, Nginx).

- `ALLOWED_ORIGIN`  
  - **Description:** Origin allowed by CORS for the React app.  
  - **Default (dev):** `http://localhost:8080` (Vite dev server)  
  - **Example (production):**  
    `ALLOWED_ORIGIN=https://golestoon.example.com`

- `CAPTCHA_API_URL`  
  - **Description:** Endpoint of the external captcha solver API.  
  - **Default:** A HuggingFace Space endpoint like  
    `https://golestan-captcha-solvers-golestan-captcha-solver.hf.space/predict`  
  - **Use case:** Override this if you host your own solver or use a different provider.

Example `.env` (for local development):

```env
PORT=8000
HOST=127.0.0.1
ALLOWED_ORIGIN=http://localhost:8080
CAPTCHA_API_URL=https://golestan-captcha-solvers-golestan-captcha-solver.hf.space/predict
```

> Adjust according to your actual deployment domain and captcha provider.

---

### 4. Running the App (Development)

Run frontend and backend in parallel (in two terminals):

```bash
# Terminal 1: React app (Vite)
npm run dev
# Vite will typically run on http://localhost:8080

# Terminal 2: Node proxy (Golestan bridge)
npx tsx server/index.ts
# Node server listens on http://127.0.0.1:8000 (or HOST:PORT from your env)
```

Once both are running:

- Open the React app in your browser (e.g. `http://localhost:8080`).  
- The app will communicate with the Node proxy at `http://127.0.0.1:8000` to fetch Golestan data and solve captchas.

---

## 🚀 Deployment

Because Golestoon now uses a **React SPA + Node.js proxy** without any heavy Python/TensorFlow runtime, it is much easier to deploy:

- **PaaS / Cloud Platforms:**
  - Railway, Render, Fly.io, Heroku-style platforms  
  - Node backends on your preferred provider  
  - Static frontend via:
    - Vercel (for `npm run build` output)  
    - Netlify / Cloudflare Pages / S3 + CloudFront  

- **Containerized (Docker):**
  - Build a Docker image containing:
    - The compiled frontend (static assets)  
    - The Node proxy (`server/index.ts`) running on Node 18+  
  - No GPU or special drivers required.  

Key points:

- You only need **Node + static hosting**; the heavy captcha computation is offloaded to your configured `CAPTCHA_API_URL`.  
- You can scale the Node proxy horizontally without worrying about ML model loading time or GPU memory.

---

## 🙌 Credits

Golestoon is the result of collaboration between several people:

- **Pezhman** – main developer & maintainer of the web app  
  GitHub: [@Pezhm4n](https://github.com/Pezhm4n)

- **Aydin** – AI captcha solver & model work  
  GitHub: [@tig-ndi](https://github.com/tig-ndi)

- **Shayan** – backend APIs and data-fetching pipelines  
  GitHub: [@shayan-shm](https://github.com/shayan-shm)

- **Mahyar** – testing, QA, and data collection  
  GitHub: [@HTIcodes](https://github.com/HTIcodes)

---

## Disclaimer

- Golestoon is an **independent, third‑party tool** created by students/developers to make working with the Golestan system easier.  
- It is **not affiliated with, endorsed by, or officially supported by** any university, the Golestan system, or its vendors.  
- Use this tool responsibly and in accordance with your university’s regulations and policies.  
- Captcha solving is performed by an external AI service; you are responsible for ensuring that your usage complies with applicable terms of service and local laws.
