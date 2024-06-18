import { TModel, TSysInfo } from "../types/schemas";
import ApiClient from "./client";

const client = new ApiClient("").localClient;

export const getSysInfo = async (): Promise<TSysInfo> => {
  const response = await client.get("/sysinfo");
  return response.data;
};

export const getHighlights = async (): Promise<TModel[]> => {
  const response = await client.get("/highlights");
  return response.data;
};
