import { PropsWithChildren } from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";

import QueryProvider from "@/Providers/QueryProvider";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Letters to casper",
    description: "Generated by create next app",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en">
            <body className={poppins.className}>
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    );
}
