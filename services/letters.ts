import client from "./client";

export const getLetters = async ({
    pageParam,
    limit,
}: {
    pageParam: number;
    limit: number;
}) => {
    const res = await client.get(`/messages`, {
        params: { offset: pageParam, limit },
    });
    return res.data;
};

export const searchLetters = async (searchTerm: string) => {
    const res = await client.get(`/messages`, {
        params: { search: searchTerm },
    });
    return res.data;
};
