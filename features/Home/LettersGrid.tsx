"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import LetterCard from "./LetterCard";
import { Letter, useGetLetters, useSearchLetters } from "./useLetters";
import { useInView } from "react-intersection-observer";
import { useEffect, useState } from "react";
import ViewLetterModal from "./ViewLetterModal";
import useSearchTerm from "./useSearch";
import useDebounce from "@/utils/debounce";

function LettersGrid() {
    const { searchTerm } = useSearchTerm();
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [letter, setLetter] = useState<Letter | undefined>(undefined);
    const { ref, inView } = useInView();

    const { data: letters, fetchNextPage, ...lettersState } = useGetLetters();
    const { data: searchedLetters, ...searchState } =
        useSearchLetters(debouncedSearchTerm);

    const messages = debouncedSearchTerm
        ? searchedLetters?.messages
        : letters?.pages.reduce(
              (total, curr) => total.concat(curr.messages),
              [] as Letter[],
          );

    const totalLettersCount =
        (letters?.pages[0].counts.approved || 0) +
        (letters?.pages[0].counts.unapproved || 0);

    useEffect(() => {
        if (inView && !debouncedSearchTerm) {
            fetchNextPage();
        }
    }, [fetchNextPage, inView, debouncedSearchTerm]);

    if (lettersState.isLoading || searchState.isLoading)
        return <p>Loading...</p>;
    else if (!messages?.length) return <p>No Messages Found.</p>;

    return (
        <>
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-none text-primary">
                    All Letters
                </h1>
                <p className="text-md font-semibold leading-none text-slate-400">
                    {totalLettersCount} Letters
                </p>
            </div>
            <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}
            >
                <Masonry>
                    <div className="m-1 grid min-h-[80px] place-items-center rounded-lg bg-primary p-4 text-center text-lg font-bold uppercase text-primary-foreground md:text-xl lg:min-h-[120px] lg:text-2xl">
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
