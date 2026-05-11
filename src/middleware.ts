import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req

  const isApiRoute = nextUrl.pathname.startsWith("/api")
  const isAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isPublicRoute = ["/login", "/register"].includes(nextUrl.pathname)

  if (isAuthRoute) return null
  
  if (isLoggedIn && isPublicRoute) {
    return Response.redirect(new URL("/", nextUrl))
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  if (isApiRoute && !isLoggedIn && !isPublicRoute) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
