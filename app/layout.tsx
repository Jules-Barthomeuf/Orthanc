import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORTHANC - Luxury Real Estate Vault",
  description:
    "The private digital vault system for ultra-luxury real estate investment analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-luxury-dark text-white">{children}</body>
    </html>
  );
}
