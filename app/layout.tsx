import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "../components/layout/ClientLayout";
import { Providers } from "./providers";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Management Task List",
  description: "A modern project management interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <Providers>
          <Suspense fallback={<LoadingSpinner />}>
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
