import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const cairo = Cairo({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "فروج الأمين",
  description: "أطيب فروج مشوي",
  openGraph: {
    title: "فروج الأمين",
    description: "أطيب فروج مشوي",
    images: [
      {
        url: "/og-image.png", // The path to your image
        width: 500,
        height: 500,
        alt: "فروج الأمين - أطيب فروج مشوي",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "فروج الأمين",
    description: "أطيب فروج مشوي",
    images: ["/og-image.png"], // The path to your image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${cairo.variable} antialiased bg-black text-white`}>
        <Header /> 
        {children}
        <Footer />
      </body>
    </html>
  );
}