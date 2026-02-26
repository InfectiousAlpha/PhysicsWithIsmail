# ⚛️ Physics & Math Academy

An interactive, secure, and sequential learning platform built with Next.js 14. This application features a gamified course dashboard where students learn physics and mathematics concepts through rich HTML5 Canvas simulations and interactive React components, unlocking new levels and tracking high scores as they progress.

## ✨ Key Features

* **🔬 Interactive Physics Engine:** Custom-built 2D physics simulations using HTML5 Canvas. Includes real-time rendering of single-particle rotations, rigid rotor systems, multi-particle inertia summation, and integral approximations.
* **🧮 Gamified Mathematics:** Interactive math modules including addition/subtraction visualization, a time-based speed-quiz system with score multipliers, and an interactive calculator.
* **📈 Sequential Progression:** Users start at Level 0 in both Math and Physics tracks. They must achieve passing grades to unlock subsequent modules.
* **🔒 Secure Authentication:** Custom credentials authentication powered by NextAuth.js, with robust route protection using Next.js middleware.
* **☁️ Persistent Cloud Data:** Integrates seamlessly with `@vercel/postgres` to securely store user progression levels and high scores via Server Actions (`GREATEST()` logic ensures scores only improve).
* **⚡ Next.js 14 Architecture:** Leverages the latest App Router, Server Actions for seamless database mutations, and dynamic file-system-based component loading for simulations.

## 🛠️ Tech Stack

* **Framework:** [Next.js 14.1.0](https://nextjs.org/) (App Router, Server Actions)
* **Library:** [React 18](https://reactjs.org/)
* **Authentication:** [NextAuth.js v4](https://next-auth.js.org/)
* **Database:** [@vercel/postgres](https://vercel.com/docs/storage/vercel-postgres)
* **Styling:** Custom CSS & Tailwind CSS base
* **Simulations:** HTML5 Canvas API & React State

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v18.17 or higher recommended)
* npm, yarn, or pnpm
* A Vercel Postgres Database (or standard PostgreSQL database)

### 1. Clone and Install
Clone the repository and install the required dependencies:

```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory. The application requires specific environment variables to handle user credentials, session encryption, and database connections.

```env
# NextAuth Secret for encrypting sessions (Generate: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-change-me"

# JSON string containing allowed users and their passwords
APP_USERS='[{"username": "admin", "password": "password123"}, {"username": "ismail", "password": "physics123"}]'

# NextAuth URL (Usually http://localhost:3000 for local dev)
NEXTAUTH_URL="http://localhost:3000"

# Vercel Postgres Connection
POSTGRES_URL="postgres://default:xyz..."
POSTGRES_PRISMA_URL="postgres://default:xyz..."
POSTGRES_URL_NON_POOLING="postgres://default:xyz..."
POSTGRES_USER="default"
POSTGRES_HOST="ep-..."
POSTGRES_PASSWORD="xyz"
POSTGRES_DATABASE="verceldb"
```

### 3. Run the Development Server
Start the Next.js development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser. If you are not logged in, you will be automatically redirected to `/login`.

## 📂 Project Structure

```text
├── app/
│   ├── actions.js                      # Server actions (handles database level-ups & scores via Postgres)
│   ├── api/auth/[...nextauth]/route.js # NextAuth configuration & Credentials provider logic
│   ├── components/                     # Reusable React components
│   │   ├── DashboardTabs.jsx           # Tabbed navigation for Physics vs Math tracks
│   │   ├── SimulationCarousel.jsx      # Dynamic simulation loader and score aggregator
│   │   └── simulations/                # The core interactive Canvas/React modules
│   ├── courses/
│   │   └── [id]/page.jsx               # Dynamic course viewing page & Postgres access guardrails
│   ├── lib/
│   │   ├── courses.js                  # Central list of course data & requirements
│   │   └── simulationData.js           # Metadata, passing grades, and configuration for modules
│   └── page.jsx                        # Protected dashboard & user data hydration
└── middleware.js                       # NextAuth route protection
```

## 🧠 Simulation Engine Architecture

The platform uses a dynamic loading system for its simulations:
1. When a user navigates to a course (`/courses/[id]`), the server dynamically reads the `app/components/simulations/course[id]` directory.
2. It gathers all `.jsx` files, compiles them, and passes them to the `SimulationCarousel`.
3. The Carousel orchestrates the user flow: **Intro/Requirements -> Interactive Sims -> Final Report & DB Submission**.
4. Simulations report scores upward via `onScoreUpdate`. For time-based quizzes (like Math modules), speed multipliers are automatically applied to the final score.

---
*Developed with Next.js & HTML5 Canvas.*
