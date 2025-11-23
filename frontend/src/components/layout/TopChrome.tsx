"use client";

import { Search, Star, Bell } from "lucide-react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: Parameters<typeof clsx>) => twMerge(clsx(...inputs));

const pills = [
    "All",
    "Black Friday",
    "Listing",
    "Social",
    "Flyer",
    "Poster",
    "Story",
    "Promo",
];

export function TopChrome() {
    return (
        <header className="relative z-20 w-full px-4 sm:px-8 pt-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">Home</span>
                    <span className="text-[11px] uppercase tracking-[0.08em] text-white/70 px-2 py-1 rounded-full bg-white/10 border border-white/10">
                        Beta
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white text-black text-sm font-semibold px-4 py-2 shadow-lg shadow-white/10 active:scale-[0.98] transition-transform">
                        Get Pro <Star size={16} />
                    </button>
                    <button className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors">
                        <Bell size={18} />
                    </button>
                    <button className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center">
                        JD
                    </button>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search templates, tools, designs"
                            className="w-full rounded-2xl bg-white/10 border border-white/10 pl-9 pr-4 py-3 text-sm text-white placeholder:text-white/50 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/60"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="rounded-full bg-white/10 border border-white/10 text-white/90 text-sm px-4 py-2 hover:bg-white/15 transition-colors">
                            All Tools
                        </button>
                        <button className="hidden sm:inline-flex rounded-full bg-white/10 border border-white/10 text-white/90 text-sm px-4 py-2 hover:bg-white/15 transition-colors">
                            New Features
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {pills.map((pill, idx) => (
                        <button
                            key={pill}
                            className={cn(
                                "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                                idx === 0
                                    ? "bg-white text-black border-white"
                                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                            )}
                        >
                            {pill}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}

export function BottomNav() {
    const items = [
        { label: "Home", icon: "M3 12l7 7 11-11", active: true },
        { label: "All Tools", icon: "M3 5h18M3 12h18M3 19h18" },
        { label: "Batch", icon: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" },
        { label: "Account", icon: "M12 12a5 5 0 100-10 5 5 0 000 10zm-7 7a7 7 0 0114 0" },
    ];

    return (
        <nav className="pointer-events-auto fixed bottom-0 left-0 right-0 z-40 px-6 pb-6">
            <div className="mx-auto max-w-md rounded-3xl bg-black/70 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/40">
                <div className="grid grid-cols-4 text-center text-xs font-semibold text-white/60">
                    {items.map((item) => (
                        <button
                            key={item.label}
                            className={cn(
                                "flex flex-col items-center gap-1 py-3 transition-colors",
                                item.active ? "text-white" : "hover:text-white"
                            )}
                            aria-pressed={item.active}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={cn("h-5 w-5", item.active && "stroke-[2.2]")}
                                aria-hidden
                            >
                                <path d={item.icon} />
                            </svg>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}

// Hide scrollbar helper
if (typeof document !== "undefined") {
    const styleId = "no-scrollbar-style";
    if (!document.getElementById(styleId)) {
        const style = document.createElement("style");
        style.id = styleId;
        style.innerHTML = `.no-scrollbar::-webkit-scrollbar{display:none;} .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`;
        document.head.appendChild(style);
    }
}
