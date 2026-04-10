import type { Metadata } from "next";
import "./globals.css";
import { geist, ibmPlexSerif, kumbhSans } from "./fonts";
import { Providers } from "@/components/Providers";


export const metadata: Metadata = {
  title: "Hackrpost",
  description: "AI-powered content generation and scheduling for startups",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${ibmPlexSerif.variable} ${kumbhSans.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
