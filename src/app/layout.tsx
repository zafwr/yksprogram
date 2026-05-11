import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/session-provider";
import { auth } from "@/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nimiyks 🌸 | YKS Program & İstatistik",
  description: "Modern YKS çalışma ve takip sistemi",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans min-h-screen flex flex-col antialiased text-base`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen overflow-hidden relative">
              {/* Decorative Flowers */}
              <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40 z-0">
                <div className="absolute -top-6 -left-6 text-6xl rotate-12">🌸</div>
                <div className="absolute top-1/4 -right-8 text-5xl -rotate-12">🌺</div>
                <div className="absolute bottom-1/4 -left-8 text-5xl rotate-45">🌷</div>
                <div className="absolute -bottom-6 right-6 text-6xl -rotate-12">🌸</div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] opacity-[0.03] grayscale">🌸</div>
              </div>

              <div className="relative flex h-screen w-full overflow-hidden z-10">
                {isLoggedIn && <Sidebar />}
                <div className="flex flex-1 flex-col overflow-hidden">
                  {isLoggedIn && <Navbar />}
                  <main className={isLoggedIn ? "flex-1 overflow-y-auto p-6" : "min-h-screen flex flex-col"}>
                    {children}
                  </main>
                </div>
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
