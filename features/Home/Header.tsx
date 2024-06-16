import { Input } from "@/components/ui/input";
import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { FaFileCirclePlus, FaPlus } from "react-icons/fa6";

function AppLogo() {
    return (
        <div className="relative h-[70px] min-w-[400px] object-contain">
            <Image src="/logo/ltc_logo.webp" alt="app logo" fill />
        </div>
    );
}

function SearchBar() {
    return (
        <div className="relative flex min-w-[400px] items-center">
            <FaSearch className="absolute left-4 text-lg text-neutral-500" />
            <Input
                type="search"
                placeholder="Search Letters"
                className="h-12 w-full rounded-full bg-white p-4 pl-10 text-lg font-semibold"
            />
        </div>
    );
}

function LeaveALetterBtn() {
    return (
        <div className="group flex cursor-pointer items-center gap-4 rounded-lg bg-white p-4 transition-all duration-100 ease-in-out hover:bg-primary">
            <div className="grid size-10 place-items-center rounded-full bg-primary/20 group-hover:bg-white">
                <FaFileCirclePlus className="size-5 text-primary" />
            </div>
            <div>
                <div className="flex items-center gap-1">
                    <div className="grid size-3 place-items-center rounded-full bg-gray-400 group-hover:bg-white">
                        <FaPlus className="size-[6px] text-white group-hover:text-primary" />
                    </div>
                    <p className="text-xs font-semibold leading-none text-gray-400 group-hover:text-white">
                        New Letter
                    </p>
                </div>
                <p className="text-lg font-bold leading-none text-primary group-hover:text-white">
                    Leave a Letter
                </p>
            </div>
        </div>
    );
}

function Header() {
    return (
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 p-2 md:p-4">
            <div className="flex items-center gap-6">
                <AppLogo />
                <SearchBar />
            </div>
            <LeaveALetterBtn />
        </header>
    );
}

export default Header;
