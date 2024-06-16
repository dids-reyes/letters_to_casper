import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import QueryProvider from "@/Providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Letters to casper",
    description: "Generated by create next app",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
