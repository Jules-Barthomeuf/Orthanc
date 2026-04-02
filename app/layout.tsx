import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { RootWrapper } from "@/components/root-wrapper";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="en" className={montserrat.variable}>
      <body className="bg-luxury-dark text-white antialiased">
        <RootWrapper>{children}</RootWrapper>
      </body>
    </html>
  );
}
