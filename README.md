# PhysicsWithIsmail - Simple Auth App

A minimal, secure web application built with Next.js 14 and NextAuth.js. This project demonstrates how to implement a custom Credentials-based authentication system with route protection using Next.js middleware.

## ✨ Features
* **Next.js 14 App Router:** Utilizes the latest Next.js features and app directory structure.
* **Custom Credentials Authentication:** Uses NextAuth.js to authenticate users against a securely stored environment variable.
* **Route Protection:** Next.js middleware automatically redirects unauthenticated users from the protected dashboard (`/`) to the `/login` page.
* **Session Management:** Built-in login and logout functionality with session persistence.
* **Tailwind CSS Setup:** Ready for utility-first styling (base directives included).
* **Responsive UI:** Clean, custom-styled login form and dashboard built with CSS flexbox.

## 🛠️ Tech Stack
* **Framework:** Next.js (v14.1.0)
* **Library:** React (v18)
* **Authentication:** NextAuth.js (v4.24.5)
* **Styling:** Custom CSS & Tailwind CSS

## 🚀 Getting Started
Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v18.17 or higher recommended)
* npm, yarn, or pnpm

### 1. Clone and Install
Clone the repository and install the required dependencies:

```bash
# Clone the repository (replace with your repo URL if applicable)
git clone <repository-url>
cd PhysicsWithIsmail-main

# Install dependencies
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory of your project. The application requires specific environment variables to handle user credentials and session encryption securely.

Add the following to your `.env.local` file:

```env
# NextAuth Secret for encrypting sessions (Generate one using: openssl rand -base64 32)
NEXTAUTH_SECRET="your-super-secret-key-change-me"

# JSON string containing allowed users and their passwords
APP_USERS='[{"username": "admin", "password": "password123"}, {"username": "ismail", "password": "physics123"}]'

# NextAuth URL (Required for production, usually http://localhost:3000 for local dev)
NEXTAUTH_URL="http://localhost:3000"
```
*Note: The `APP_USERS` variable must be a strictly valid JSON array of objects, containing `username` and `password` keys.*

### 3. Run the Development Server
Start the Next.js development server:

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser. If you are not logged in, you will be automatically redirected to `/login`.

## 📂 Project Structure

```text
├── app/
│   ├── api/auth/[...nextauth]/route.js # NextAuth configuration & Credentials provider logic
│   ├── components/                     # Reusable React components
│   │   └── LogoutButton.jsx            # Client-side logout button component
│   ├── login/
│   │   └── page.jsx                    # Login page UI and sign-in handling
│   ├── globals.css                     # Global styles, Tailwind directives, and UI classes
│   ├── layout.jsx                      # Root HTML layout and metadata
│   └── page.jsx                        # Protected home/dashboard page
├── middleware.js                       # NextAuth middleware protecting the "/" route
├── package.json                        # Project dependencies and scripts
└── README.md                           # Project documentation
```

## 🔒 Authentication Flow Explained
* **Protection:** The `middleware.js` file is configured to match the `/` route. If a user visits the root page without a valid NextAuth session cookie, they are redirected to `/login`.
* **Authorization:** When a user submits the login form in `app/login/page.jsx`, a call is made to the `signIn('credentials', ...)` NextAuth function.
* **Validation:** The NextAuth route handler (`app/api/auth/[...nextauth]/route.js`) parses the `APP_USERS` environment variable and checks if the submitted username and password match any user in that JSON array.
* **Session:** If matched, NextAuth generates a session, and the user is redirected to the protected dashboard (`/`).

## 📝 Scripts
* `npm run dev`: Starts the development server.
* `npm run build`: Builds the app for production.
* `npm run start`: Runs the built production application.
* `npm run lint`: Runs ESLint to check for code issues.
