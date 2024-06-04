import axios, { AxiosInstance, AxiosProgressEvent } from 'axios'

export const ROOTURL = 'http://0.0.0.0:8899';

export class ApiClient {
  client: AxiosInstance
  constructor(basePath: string, onProgressCallback?: (data: any) => void) {
    this.client = axios.create({
      baseURL: `${ROOTURL}/${basePath}` ?? '/',
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgressCallback) {
          const xhr = progressEvent.event.target
          const { responseText } = xhr
          try {
            let data = responseText.split("data: ")[1]
            data = JSON.parse(data)
            onProgressCallback(data)
          } catch (e) {
            console.error("Error parsing progress event", e)
          }
        }
      }
    });
  }

  get = async (url: string) => {
    const response = await this.client.get(url);
    return response.data;
  }

  post = async (url: string, data: any) => {
    const response = await this.client.post(url, JSON.stringify(data));
    return response.data;
  }
}

const defaultClient = new ApiClient("")

export default defaultClient

