export { default } from "next-auth/middleware"

// This line protects the entire site
export const config = { matcher: ["/"] }
