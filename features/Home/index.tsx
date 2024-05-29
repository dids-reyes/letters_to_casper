import LettersGrid from "./LettersGrid";

function HomePage() {
    return (
        <div className="mx-auto grid w-full max-w-6xl grid-rows-[auto_1fr] gap-4 p-2 md:p-4">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-none text-primary">
                    All Letters
                </h1>
                <div className="text-sm font-semibold leading-none text-slate-400">
                    975 Letters
                </div>
            </div>
            <LettersGrid />
        </div>
    );
}

export default HomePage;
