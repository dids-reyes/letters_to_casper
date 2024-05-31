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
            <div>
                <h1 className="font-bold leading-tight">From: {letter.from}</h1>
                <h1 className="font-bold leading-tight">To: {letter.to}</h1>
            </div>
            <div className="line-clamp-6 text-sm">{letter.message}</div>
        </article>
    );
}

export default LetterCard;
