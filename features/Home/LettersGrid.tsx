"use client";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import letters from "./dummyLetters";
import LetterCard from "./LetterCard";

function LettersGrid() {
    return (
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4 }}>
            <Masonry>
                <div className="m-1 grid min-h-[80px] place-items-center rounded-lg bg-blue-800 p-8 text-center text-lg font-bold uppercase text-primary-foreground md:text-2xl lg:min-h-[120px] lg:text-4xl">
                    featured
                </div>
                {letters.map((letter) => (
                    <LetterCard key={letter.id} letter={letter} />
                ))}
            </Masonry>
        </ResponsiveMasonry>
    );
}

export default LettersGrid;
