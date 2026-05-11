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
  title: "YKS Program & İstatistik",
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
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex h-screen overflow-hidden">
              {isLoggedIn && <Sidebar />}
              <div className="flex flex-1 flex-col overflow-hidden">
                {isLoggedIn && <Navbar />}
                <main className={isLoggedIn ? "flex-1 overflow-y-auto bg-muted/10 p-6" : "min-h-screen flex flex-col"}>
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
