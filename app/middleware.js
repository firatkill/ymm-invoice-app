import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  // cors preflight ayarı
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,DELETE,OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    return response;
  }
  // /api/auth/** isteklerini middleware dışı bırak -> tarayıcıda hata verdi
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  // token al
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isLogin = request.nextUrl.pathname === "/login";
  const isRegister = request.nextUrl.pathname === "/register";

  // If user has token
  if (token) {
    // zaten giriş yapılmışsa /login ve /registera gidemesin
    if (isLogin || isRegister) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // headera kullanıcı bilgilerini ekle (her route'ta yeniden tokeni çekmemek için)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", token.id);
    requestHeaders.set("x-user-email", token.email);
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }
  console.log(token);

  // eğer token yoksa
  if (!token) {
    // login register gidebilsin
    if (isLogin || isRegister) {
      return NextResponse.next();
    }
    // diğer tüm routelara erişmeye çalıştığında logine gitsin
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!/:path*|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|fonts|images|icons|login|register).*)",
  ],
};
