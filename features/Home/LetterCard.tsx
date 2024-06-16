import { Letter } from "./useLetters";

interface Props {
    letter: Letter;
    onClick: () => void;
}

function LetterCard({ letter, onClick }: Props) {
    return (
        <article
            onClick={onClick}
            className="m-1 cursor-pointer space-y-2 rounded-lg border bg-white p-4"
        >
            <div className="text-sm">
                <h1 className="leading-tight">
                    <strong>From:</strong> {letter.from}
                </h1>
                <h1 className="leading-tight">
                    <strong>To:</strong> {letter.to}
                </h1>
            </div>
            <div className="line-clamp-6 text-xs tracking-wide">
                {letter.message}
            </div>
        </article>
    );
}

export default LetterCard;
