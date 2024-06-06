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

    const downloadIcon =
        process.env.NODE_ENV === "development"
        ? "/assets/icons/download-fill.svg"
        : "../../renderer/main_window/assets/icons/download-fill.svg";
    const playIcon =
        process.env.NODE_ENV === "development"
        ? "/assets/icons/play.svg"
        : "../../renderer/main_window/assets/icons/play.svg";
    const pauseIcon =
        process.env.NODE_ENV === "development"
        ? "/assets/icons/pause.svg"
        : "../../renderer/main_window/assets/icons/pause.svg";

    if (status === "NOT_DOWNLOADED")
        return (
            <div onClick={installModel} className="h-8 w-8 absolute bottom-0 right-0 m-2 bg-surface-100 rounded-full">
                <img src={downloadIcon} alt="" className="h-8 w-8" />
            </div>
        ) 

    if (status === "DOWNLOADING") return <div className="relative"></div>;
    if (status === "INSTALLING") return <div className="relative"></div>;
    
    if (status === "RUNNING") 
        return (
            <div className="h-8 w-8 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-surface-100 rounded-full">
                <img src={pauseIcon} alt="" className="h-8 w-8" />
            </div>
        )   
    
    if (status === "STOPPED") 
        return (
            <div className="h-8 w-8 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] bg-surface-100 rounded-full">
                <img src={playIcon} alt="" className="h-8 w-8" />
            </div>
        )       
};

export default function Highlights() {
    const { data, error } = useSWR<Highlight[]>('/highlights', defaultClient.get);

    if (error) return <div>Failed to load</div>;
    if (!data) return <div>Loading...</div>;

    return (
        <div className="flex gap-2.5">
            {data.map((highlight) => (
                <div key={highlight.id} className="glass-3d relative flex flex-col justify-start items-start w-[124px] h-20 p-2 rounded-sm overflow-hidden cursor-pointer">
                    <img src={highlight.background_image} alt={highlight.name} className="z-0 absolute top-0 left-0 w-full h-full object-cover" />
                    <div className="z-1 absolute top-0 left-0 w-full h-full bg-black bg-opacity-10 hover:bg-opacity-30" />
                    <p className="z-2 relative title-xs text-surface-main w-[75%] truncate">{highlight.name}</p>
                    <p className="z-2 relative title-xs text-surface-750 w-3/5 truncate">{highlight.author}</p>
                    <button className="z-2"><Status status={highlight.status} /></button>
                    <div className="z-2 absolute bottom-2 left-2 title-xs text-surface-750 w-3/5">{highlight.progress}</div>
                </div>
            ))}
        </div>
    );
}
