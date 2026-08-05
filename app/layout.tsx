import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "OLFACTUS", template: "%s | OLFACTUS" },
  description: "Fragrance intelligence for better collection decisions.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
