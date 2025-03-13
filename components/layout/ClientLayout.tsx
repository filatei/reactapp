'use client';

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
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
            <Sidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  );
} 