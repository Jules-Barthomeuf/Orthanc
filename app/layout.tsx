import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import { RootWrapper } from "@/components/root-wrapper";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "Orthanc - %s",
    default: "Orthanc",
  },
  description:
    "The private digital vault system for ultra-luxury real estate investment analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <body className="bg-luxury-dark text-white antialiased">
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  );
}
