import axios from "axios";

const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
    },
});

export default client;
