import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import QueryProvider from "@/components/providers/QueryProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import "@/styles/globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["vietnamese", "latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hải Đăng Map",
  description: "Bản đồ hỗ trợ người khuyết tật tại Việt Nam",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DMap",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: import("next").Viewport = {
  themeColor: "#0b57d0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${robotoMono.variable}`}
    >
      <body suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
