"use client";

import { Input } from "@/components/ui/input";
import { ChangeEvent } from "react";
import { FaSearch } from "react-icons/fa";
import useSearchTerm from "../useSearch";

function SearchBar() {
    const { searchTerm, updateSearch } = useSearchTerm();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
        updateSearch(e.target.value);

    return (
        <div className="relative flex min-w-[400px] items-center">
            <FaSearch className="absolute left-4 text-lg text-neutral-500" />
            <Input
                type="search"
                placeholder="Search Letters"
                className="h-12 w-full rounded-full bg-white p-4 pl-10 text-lg font-semibold"
                value={searchTerm}
                onChange={handleChange}
            />
        </div>
    );
}

export default SearchBar;
