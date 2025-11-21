import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // <--- CRITICAL IMPORT

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "OpenDream",
    description: "AI Photo Editor",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>{children}</body>
        </html>
    );
}