"use client";

import * as lettersService from "@/services/letters";
import {
    InfiniteData,
    skipToken,
    useInfiniteQuery,
    useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export interface Letter {
    _id: string;
    from: string;
    to: string;
    approve: boolean;
    message: string;
    reads: number;
    timestamp: string;
}

interface successResponse {
    counts: { approved: number; unapproved: number };
    messages: Letter[];
}

export const useGetLetters = () =>
    useInfiniteQuery<successResponse, AxiosError<string>>({
        queryFn: ({ pageParam }) =>
            lettersService.getLetters({
                pageParam: pageParam as number,
                limit: 50,
            }),
        queryKey: ["letters"],
        initialPageParam: 0,
        getNextPageParam: (lastpage, allPages) => {
            const nextPage = allPages.reduce(
                (total, curr) => (total += curr.messages.length),
                0,
            );
            return nextPage;
        },
    });

export const useSearchLetters = (searchTerm?: string) =>
    useQuery<successResponse, AxiosError<string>>({
        queryKey: ["letters", searchTerm],
        queryFn: searchTerm
            ? () => lettersService.searchLetters(searchTerm)
            : skipToken,
    });
