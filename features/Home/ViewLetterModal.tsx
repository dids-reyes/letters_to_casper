import { BsMailboxFlag } from "react-icons/bs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Letter } from "./useLetters";

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

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="text-left">
                    <DialogTitle>From: {letter?.from}</DialogTitle>
                    <DialogTitle>To: {letter?.to}</DialogTitle>
                </DialogHeader>
                <div>
                    <BsMailboxFlag />
                    <p className="text-sm leading-relaxed">
                        {sanitizedMessage}
                    </p>
                </div>
                <div>
                    {ytID && (
                        <iframe
                            width="100%"
                            height={300}
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
            </DialogContent>
        </Dialog>
    );
}

export default ViewLetterModal;
