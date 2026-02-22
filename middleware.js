export { default } from "next-auth/middleware"

// This matcher protects all routes EXCEPT login, api routes, and static Next.js assets
export const config = { 
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login).*)"] 
}
