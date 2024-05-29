import React, { PropsWithChildren } from "react";

function HomeLayout({ children }: PropsWithChildren) {
    return (
        <main className="grid h-screen grid-rows-[auto_1fr] overflow-auto bg-slate-100">
            {children}
        </main>
    );
}

export default HomeLayout;
