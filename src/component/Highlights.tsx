import React from "react";
import useSWR from 'swr';
import defaultClient, { ApiClient } from "../api/client";
import axios from "axios";

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

const Status = ({ status }: { status: Highlight['status'] }) => {
    async function installModel() {
        const api = new ApiClient("model", (data) => {
            console.log(data)
        })
        await api.post("/install", {
            id: "5ae0070b-e52e-4605-a356-de23c492203e",
            url: "https://huggingface.co/meta-llama/Meta-Llama-3-8B"
        })
    }

    if (status === "NOT_DOWNLOADED") return <button className="relative" onClick={installModel}>INSTALL</button>;
    if (status === "DOWNLOADING") return <div className="relative">DOWNLOADING</div>;
    if (status === "INSTALLING") return <div className="relative">INSTALLING</div>;
    if (status === "RUNNING") return <div className="relative">RUNNING</div>;
    if (status === "STOPPED") return <div className="relative">STOPPED</div>;
};

export default function Highlights() {
    const { data, error } = useSWR<Highlight[]>('/highlights', defaultClient.get);

    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;

    return (
        <div className="flex gap-2">
            {data.map((highlight) => (
                <div key={highlight.id} className="relative w-32 h-20 rounded-sm overflow-hidden">
                    <img src={highlight.background_image} alt={highlight.name} className="absolute w-full h-full object-cover" />
                    <div className="relative">{highlight.name}</div>
                    <div className="relative"><Status status={highlight.status} /></div>
                    <div className="relative">{highlight.progress}</div>
                </div>
            ))}
        </div>
    );
}
