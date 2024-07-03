"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import LetterCard from "./LetterCard";
import { Letter, useGetLetters } from "./useLetters";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import ViewLetterModal from "./ViewLetterModal";
import Lottie from "react-lottie-player";
import ghost1 from "../../src/lotties/ghost1.json";

function LettersGrid() {
    const [letter, setLetter] = useState<Letter | undefined>(undefined);
    const { data: letters, isLoading, fetchNextPage } = useGetLetters();
    const { ref, inView } = useInView();

    const messages = letters?.pages.reduce(
        (total, curr) => total.concat(curr.messages),
        [] as Letter[],
    );

    const totalLettersCount =
        (letters?.pages[0].counts.approved || 0) +
        (letters?.pages[0].counts.unapproved || 0);

    useEffect(() => {
        if (inView) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView]);

    if (isLoading)
        return (
            <center>
                <Lottie
                    loop
                    animationData={ghost1}
                    play
                    style={{ width: 300, height: 300 }}
                />
            </center>
        );

    return (
        <>
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-none text-primary">
                    Open Letters
                </h1>
                <p className="text-xl font-semibold leading-none text-slate-400">
                    {letters?.pages[0].counts.approved.toLocaleString()}
                </p>
            </div>
            <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}
            >
                <Masonry>
                    <div className="m-1 grid min-h-[80px] place-items-center rounded-lg bg-blue-800 p-4 text-center text-lg font-bold uppercase text-primary-foreground md:text-xl lg:text-2xl">
                        featured
                    </div>
                    {messages?.map((letter) => (
                        <LetterCard
                            key={letter._id}
                            letter={letter}
                            onClick={() => setLetter(letter)}
                        />
                    ))}
                </Masonry>
            </ResponsiveMasonry>
            <div className="h-4" ref={ref} />
            <ViewLetterModal
                letter={letter}
                open={!!letter}
                onClose={() => setLetter(undefined)}
            />
        </>
    );
}

export default LettersGrid;
