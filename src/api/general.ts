import { TModel, TNews, TSysInfo } from "../types/schemas";
import ApiClient from "./client";

const localClient = new ApiClient("").localClient;
const client = new ApiClient("").client;

export const getSysInfo = async (): Promise<TSysInfo> => {
  const response = await localClient.get("/sysinfo");
  return response.data;
};

export const getHighlights = async (): Promise<TModel[]> => {
  const response = await localClient.get("/highlights");
  return response.data;
};

export const getNews = async (): Promise<TNews[]> => {
  const response = await client.get("/news");
  return response.data;
};