import type { Metadata } from "next";
import { Inter, Limelight } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const limelight = Limelight({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-limelight",
});

export const metadata: Metadata = {
  title: "Blog Application",
  description: "A modern blog application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${limelight.variable} font-sans antialiased`} style={{ backgroundColor: '#f6f5f4' }}>
        <ToastProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ToastProvider>
      </body>
    </html>
  );
}
