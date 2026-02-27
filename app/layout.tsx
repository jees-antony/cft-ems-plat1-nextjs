import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
