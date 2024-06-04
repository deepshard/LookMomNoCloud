import axios, { AxiosInstance } from 'axios'

export const ROOTURL = 'http://0.0.0.0:8899';

export class ApiClient {
  client: AxiosInstance
  constructor(basePath: string) {
    this.client = axios.create({
      baseURL: `${ROOTURL}/${basePath}` ?? '/',
      responseType: 'json',
      headers: {}
    });
  }

  get = async (url: string) => {
    const response = await this.client.get(url);
    return response.data;
  }
}

const client = new ApiClient("")

export default client

