import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Svora Manager",
  description: "Studio management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <div className="min-h-screen bg-neutral-950 text-neutral-100">
            <Header />
            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
