import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AssessmentOS",
  description: "Assessment operations software for schools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
