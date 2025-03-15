'use client';

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { SessionProvider } from "next-auth/react";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <div className="flex flex-1">
            <div className="hidden md:block">
              <Sidebar />
            </div>
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
              {children}
            </main>
          </div>
          <MobileNav />
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
} 