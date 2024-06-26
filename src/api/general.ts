import { TModel, TSysInfo } from "../types/schemas";
import ApiClient from "./client";

const client = new ApiClient("").localClient;
const cloudClient = new ApiClient("").client;

export const getSysInfo = async (): Promise<TSysInfo> => {
  const response = await client.get("/sysinfo");
  return response.data;
};

export const getHighlights = async (): Promise<TModel[]> => {
  const response = await client.get("/highlights");
  return response.data;
};

export const getModel = async (id: string): Promise<TModel> => {
  const response = await cloudClient.get(`/models/${id}`);
  return response.data;
}


export const getFeatured = async (): Promise<TModel[]> => {
  const response = await cloudClient.get(`/models/featured`);
  return response.data;
}