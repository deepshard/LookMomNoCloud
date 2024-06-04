import React from "react";
import useSWR from 'swr';
import ApiClient from "../api/client";

interface Highlight {
    id: string;
    url: string;
    status: "NOT_DOWNLOADED" | "DOWNLOADING" | "INSTALLING" | "RUNNING" | "STOPPED";
    background_image: string;
    author: string;
    name: string;
    params: number;
    description: string;
    instance: number;
    progress: number;
}

export default function Highlights() {
    const { data, error } = useSWR<Highlight[]>('/highlights', ApiClient.get);

    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;

    return (
        <div className="flex gap-2">
            {data.map((highlight) => (
                <div key={highlight.id} className="relative w-32 h-20 rounded-sm overflow-hidden">
                    <img src={highlight.background_image} alt={highlight.name} className="absolute w-full h-full object-cover" />
                    <div className="relative">{highlight.name}</div>
                    <div className="relative">{highlight.status}</div>
                    <div className="relative">{highlight.progress}</div>
                </div>
            ))}
        </div>
    );
}
