import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SKYLENT — Learn Today. Lead Tomorrow.",
  description:
    "SKYLENT is a technology and learning platform for practical AI, real-world projects, workshops and career-ready skills.",
  icons: {
    icon: "/branding/skylent-favicon.png",
  },
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
