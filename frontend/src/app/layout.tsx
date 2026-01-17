import type { Metadata } from "next";
import { Almarai, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const almarai = Almarai({
  variable: "--font-almarai",
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "مجال بوست",
  description: "منصة إعلامية لبنانية مستقلة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${almarai.variable} ${ibmPlexArabic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
