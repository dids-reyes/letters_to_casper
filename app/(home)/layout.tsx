import Header from "@/features/Home/Header";
import React, { PropsWithChildren } from "react";

function HomeLayout({ children }: PropsWithChildren) {
    return (
        <main className="grid h-screen grid-rows-[auto_1fr] gap-y-10 overflow-auto bg-slate-100">
            <Header />
            {children}
        </main>
    );
}

export default HomeLayout;
