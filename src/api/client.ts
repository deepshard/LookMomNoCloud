import axios, { AxiosInstance } from 'axios'

export const LOCAL_ROOT_URL = 'http://0.0.0.0:8899';
const ROOT_URL = 'https://api.itsalltruffles.com';
const API_TOKEN = "wEZY6SMz/uSI4THocY1GB4vwQP5+2RfKrDdQT5SbXP4="


export class ApiClient {
  localClient: AxiosInstance
  client: AxiosInstance
  constructor(basePath: string) {
    this.localClient = axios.create({
      baseURL: `${LOCAL_ROOT_URL}/${basePath}` ?? '/',
      responseType: 'json',
      headers: {}
    });

    this.client = axios.create({
      baseURL: `${ROOT_URL}/${basePath}` ?? '/',
      responseType: 'json',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`
      }
    });
  }
}

export default ApiClient