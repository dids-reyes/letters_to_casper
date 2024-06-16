import LettersGrid from "./LettersGrid";

function HomePage() {
    return (
        <div className="mx-auto grid w-full max-w-6xl grid-rows-[auto_1fr] gap-4 p-2 md:p-4">
            <LettersGrid />
        </div>
    );
}

export default HomePage;
