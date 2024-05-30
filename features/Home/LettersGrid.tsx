"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import LetterCard from "./LetterCard";
import { Letter, useGetLetters } from "./useLetters";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

function LettersGrid() {
    const { data: letters, isLoading, fetchNextPage } = useGetLetters();
    const { ref, inView } = useInView();

    const messages = letters?.pages.reduce(
        (total, curr) => total.concat(curr.messages),
        [] as Letter[],
    );

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView]);

    if (isLoading) return <p>Loading...</p>;

    return (
        <>
            <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}
            >
                <Masonry>
                    <div className="m-1 grid min-h-[80px] place-items-center rounded-lg bg-blue-800 p-8 text-center text-lg font-bold uppercase text-primary-foreground md:text-2xl lg:min-h-[120px] lg:text-4xl">
                        featured
                    </div>
                    {messages?.map((letter) => (
                        <LetterCard key={letter._id} letter={letter} />
                    ))}
                </Masonry>
            </ResponsiveMasonry>
            <div className="h-4" ref={ref} />
        </>
    );
}

export default LettersGrid;
