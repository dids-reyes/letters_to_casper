import { BsMailboxFlag } from "react-icons/bs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Letter } from "./useLetters";
import { formatDate, formatDistanceToNow } from "date-fns";

interface Props {
    letter: Letter | undefined;
    open: boolean;
    onClose: () => void;
}

const extractMediaLinks = (message?: string) => {
    if (!message) return null;

    const spotifyLinkRegex = /https:\/\/open\.spotify\.com\/(.*)/;
    const youtubeLinkRegex = /https:\/\/youtu\.be\/(.*)/;

    const spotifyMatch = message.match(spotifyLinkRegex);
    const youtubeMatch = message.match(youtubeLinkRegex);

    const extractedMedia = {
        spotifyID: "",
        ytID: "",
        sanitizedMessage: "",
    };

    if (spotifyMatch && spotifyMatch[1]) {
        const trackId = spotifyMatch[1];
        const sanitizedLetter = message
            .replace(spotifyLinkRegex, "")
            .replace(/\s*$/, "");

        extractedMedia.spotifyID = trackId;
        extractedMedia.sanitizedMessage = sanitizedLetter;
    }

    if (youtubeMatch && youtubeMatch[1]) {
        const videoId = youtubeMatch[1];
        const sanitizedLetter = message
            .replace(youtubeLinkRegex, "")
            .replace(/\s*$/, "");

        extractedMedia.ytID = videoId;
        extractedMedia.sanitizedMessage = sanitizedLetter;
    } else {
        extractedMedia.ytID = "";
        extractedMedia.spotifyID = "";
        extractedMedia.sanitizedMessage = message;
    }

    return extractedMedia;
};

function ViewLetterModal({ letter, open, onClose }: Props) {
    const { ytID, spotifyID, sanitizedMessage } =
        extractMediaLinks(letter?.message) || {};

    if (!letter) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="font-monospace bg-[#fafaed]">
                <div className="text-left">
                    <h2>
                        <strong>From:</strong> {letter.from}
                    </h2>
                    <h2>
                        <strong>To:</strong> {letter.to}
                    </h2>
                </div>
                <div className="space-y-6">
                    <div className="grid place-items-center gap-y-2 text-center">
                        <BsMailboxFlag size={30} />
                        <p className="font-courier text-xs font-light text-gray-600">
                            {formatDate(
                                new Date(letter.timestamp),
                                "EEEE, MMMM d, yyyy h:mm a",
                            )}
                        </p>
                    </div>
                    <blockquote className="text-sm leading-tight">
                        {sanitizedMessage}
                    </blockquote>
                </div>
                <div className="overflow-hidden rounded-lg">
                    {ytID && (
                        <iframe
                            width="100%"
                            height={200}
                            src={`https://www.youtube-nocookie.com/embed/${ytID}&amp;controls=0&autoplay=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    )}
                    {spotifyID && (
                        <iframe
                            width="100%"
                            height={120}
                            src={`https://www.youtube-nocookie.com/embed/${spotifyID}&amp;controls=0&autoplay=1`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture;"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    )}
                </div>
                <div className="grid justify-end">
                    <p className="font-courier text-xs">
                        {formatDistanceToNow(letter.timestamp, {
                            addSuffix: true,
                        }).replace("about", "")}{" "}
                        - {letter.reads} reads 📖
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ViewLetterModal;
