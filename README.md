# Physics Academy - Course Learning Platform

A secure, interactive web application built with Next.js 14, NextAuth.js, and Vercel Postgres. This project functions as a sequential course dashboard where users learn physics concepts and unlock new courses as they progress.

## ✨ Features
* **Sequential Course Progression:** Users start at Level 0 and unlock subsequent courses sequentially by completing previous material.
* **Next.js 14 App Router:** Utilizes the latest Next.js features, including Server Actions and the app directory structure.
* **Custom Credentials Authentication:** Uses NextAuth.js to authenticate users against a securely stored environment variable.
* **Route Protection:** Next.js middleware automatically redirects unauthenticated users from the dashboard and course pages to the `/login` page.
* **Server-Side Data Persistence:** Uses `@vercel/postgres` to securely store and retrieve user progression levels.
* **Responsive Modern UI:** Clean, custom-styled "Physics Academy" interface with a white and sky-blue theme.

## 🛠️ Tech Stack
* **Framework:** Next.js (v14.1.0)
* **Library:** React (v18)
* **Authentication:** NextAuth.js (v4.24.5)
* **Database:** Vercel Postgres
* **Styling:** Custom CSS & Tailwind CSS base

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
Create a `.env.local` file in the root directory of your project. The application requires specific environment variables to handle user credentials, session encryption, and database connections.

Add the following to your `.env.local` file:

```env
# NextAuth Secret for encrypting sessions (Generate one using: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-change-me"

# JSON string containing allowed users and their passwords
APP_USERS='[{"username": "admin", "password": "password123"}, {"username": "ismail", "password": "physics123"}]'

# NextAuth URL (Required for production, usually http://localhost:3000 for local dev)
NEXTAUTH_URL="http://localhost:3000"

# Vercel Postgres Connection (Get these from your Vercel Dashboard)
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
│   ├── actions.js                      # Server actions (handles database level-ups via Postgres)
│   ├── api/auth/[...nextauth]/route.js # NextAuth configuration & Credentials provider logic
│   ├── components/                     # Reusable React components
│   │   ├── CompleteCourseButton.jsx    # Client component to trigger course completion
│   │   └── LogoutButton.jsx            # Client-side logout functionality
│   ├── courses/
│   │   └── [id]/page.jsx               # Dynamic course viewing page & access guardrails
│   ├── lib/
│   │   └── courses.js                  # Central list of course data & requirements
│   ├── login/
│   │   └── page.jsx                    # Login page UI and sign-in handling
│   ├── globals.css                     # Global styles, theming, and UI classes
│   ├── layout.jsx                      # Root HTML layout and metadata
│   └── page.jsx                        # Protected course dashboard
├── middleware.js                       # NextAuth middleware protecting app routes
└── package.json                        # Project dependencies and scripts
```

## 🔒 Course & Authentication Flow Explained
* **Authentication:** When a user logs in via `app/login/page.jsx`, NextAuth validates credentials against the `APP_USERS` environment variable.
* **Global Protection:** The `middleware.js` file prevents unauthorized access to the dashboard (`/`) and any internal courses (`/courses/...`).
* **Progression Logic:** * The dashboard reads the central `courses.js` file and compares it to the user's current level pulled from Postgres.
  * If the user's level meets a course's `requiredLevel`, they can enter.
  * Clicking "Complete Course" triggers a Server Action (`actions.js`) that updates their level in Postgres using `GREATEST()` to ensure levels only go up, never down.

## 📝 Scripts
* `npm run dev`: Starts the development server.
* `npm run build`: Builds the app for production.
* `npm run start`: Runs the built production application.
