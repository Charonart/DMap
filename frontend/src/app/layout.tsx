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
  title: "DMap - Accessibility Map",
  description: "Community-driven accessibility map for disabled people in Vietnam.",
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
