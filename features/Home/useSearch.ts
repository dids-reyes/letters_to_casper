import { create } from "zustand";

interface SearchState {
    searchTerm: string;
}

interface SearchAction {
    updateSearch: (value: string) => void;
}

const useSearchTerm = create<SearchState & SearchAction>()((set) => ({
    searchTerm: "",
    updateSearch: (searchTerm) => set({ searchTerm }),
}));

export default useSearchTerm;
