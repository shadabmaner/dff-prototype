import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { AppSessionProvider } from "@/components/providers/session-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";



export const metadata: Metadata = {
  metadataBase: new URL("https://app.medikiz.in"),
  title: {
    default: "Medikiz Nexus — Clinical & Lifestyle Medicine Platform",
    template: "%s | Medikiz Nexus",
  },
  description:
    "India's leading diabetes reversal & lifestyle medicine platform. Blending clinical care, structured patient education, and intelligent digital tools — by Dr. Bhagyesh Kulkarni.",
  keywords: [
    "diabetes reversal",
    "lifestyle medicine",
    "clinical management platform",
    "patient education",
    "teleconsultation",
    "diabetologist India",
    "Dr Bhagyesh Kulkarni",
    "Medikiz Nexus",
    "healthcare SaaS",
    "diet programs",
    "health analytics",
  ],
  authors: [{ name: "Dr. Bhagyesh Kulkarni", url: "https://drbhagyeshkulkarni.com" }],
  creator: "Medikiz Healthcare LLP",
  publisher: "Medikiz Healthcare LLP",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "https://onpointnexus.com/logo-icon.png", type: "image/png" },
    ],
    apple: [
      { url: "https://onpointnexus.com/logo-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://app.medikiz.in",
    siteName: "Medikiz Nexus",
    title: "Medikiz Nexus — Clinical & Lifestyle Medicine Platform",
    description:
      "India's leading diabetes reversal & lifestyle medicine platform. Clinical management, patient education, teleconsult, and health analytics — all in one place.",
    images: [
      {
        url: "https://onpointnexus.com/logo-icon.png",
        width: 1200,
        height: 630,
        alt: "Medikiz Nexus — Healthcare · Education · Technology",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medikiz Nexus — Clinical & Lifestyle Medicine Platform",
    description:
      "India's leading diabetes reversal platform. Clinical care, education & digital health tools by Dr. Bhagyesh Kulkarni.",
    images: ["https://onpointnexus.com/logo-icon.png"],
    creator: "@medikiz",
  },
  category: "healthcare",
};
const poppins = Poppins({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body
        className={` antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="fresh" enableSystem>
          <AppSessionProvider>
            <QueryProvider>
              <AuthProvider>
                {children}
                <Toaster />
              </AuthProvider>
            </QueryProvider>
          </AppSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
