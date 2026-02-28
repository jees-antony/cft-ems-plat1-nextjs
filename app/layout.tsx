import type { Metadata } from "next";
import "./globals.css";
import { FooterTimestamp } from "@/components/FooterTimestamp";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "CFT Energy Dash",
  description: "Real-time energy monitoring dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout-wrapper" style={{ paddingBottom: "80px" }}>
          {children}
        </div>
        <BottomNav />
        <FooterTimestamp />
      </body>
    </html>
  );
}
