import { TModel, TSysInfo } from "src/types/schemas";
import ApiClient from "./client";

let client = new ApiClient('').client

export const getSysInfo = async (): Promise<TSysInfo> => {
    const response = await client.get('/sysinfo');
    return response.data;
}

export const getHighlights = async (): Promise<TModel[]> => {
    const response = await client.get('/highlights');
    return response.data;
}