import ApiClient from "./client";

let client = new ApiClient('model').client

const installModel = async (url: string) => {
    const response = await client.post('/install', { url });
    return response.data;
};