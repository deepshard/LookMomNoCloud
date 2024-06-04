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
}

export default ApiClient