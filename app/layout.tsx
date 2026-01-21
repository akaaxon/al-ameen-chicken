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