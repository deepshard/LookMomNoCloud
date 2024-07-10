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
export const quitApp = async (): Promise<boolean> => {
  const response = await localClient.post("/quit");
  return response.status === 200;
};

export const getNews = async (): Promise<TNews[]> => {
  const response = await client.get("/news");
  return response.data;
}

export const getFeatured = async (): Promise<TModel[]> => {
  const response = await client.get(`/models/featured`);
  return response.data;
}

export const getTrendingModels = async (): Promise<TModel[]> => {
  const response = await client.get(`/models/trending?k=40`);
  return response.data;
}

export const getNewModels = async (): Promise<TModel[]> => {
  const response = await client.get(`/models/new?k=40`);
  return response.data;
}
