import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Macro Licznik",
  description: "Aplikacja do liczenia makroskładników",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-surface-dark text-gray-100">
        {children}
      </body>
    </html>
  );
}
