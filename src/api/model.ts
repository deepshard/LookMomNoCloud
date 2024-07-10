import { Settings } from "../pages/Playground/playgroundTypes";
import { TModel } from "../types/schemas";
import ApiClient, { LOCAL_ROOT_URL } from "./client";

const localClient = new ApiClient("model").localClient;
const client = new ApiClient("models").client;

export const startInstallModel = async (model: TModel, signal: AbortSignal, callback: (response: Partial<TModel>) => void) => {
  return fetch(LOCAL_ROOT_URL + "/model/install", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      url: model.hfLink,
      id: model.id,
    }),
    signal: signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response;
    })
    .then((response) => {
      const reader = response?.body?.getReader();
      return new ReadableStream({
        start(controller) {
          function push() {
            try {
              // Read from the stream
              reader?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                // Decode and process the chunk
                const text = new TextDecoder().decode(value).substring(6).trim(); // will remove the 'data: ' prefix
                const downloadResponse: Partial<TModel> = JSON.parse(text);
                if (downloadResponse.error) {
                  downloadResponse.status = "NOT_DOWNLOADED";
                }
                callback(downloadResponse);
                controller.enqueue(value);
                push();
              });
            } catch (error: any) {
              callback({ ...model, status: "NOT_DOWNLOADED", error: `${error.message ? error.message : error}` });
              controller.error(error);
            }
          }
          push();
        },
      });
    });
};

export const startRunModels = async (models: TModel[], signalController: AbortController, callback: (response: Partial<TModel>, controller: AbortController) => void) => {
  return fetch(LOCAL_ROOT_URL + "/model/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      ids: models.map((model) => model.id),
    }),
    signal: signalController.signal,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response;
    })
    .then((response) => {
      const reader = response?.body?.getReader();
      return new ReadableStream({
        start(controller) {
          function push() {
            try {
              // Read from the stream
              reader?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                // Decode and process the chunk
                const text = new TextDecoder().decode(value).substring(6).trim(); // will remove the 'data: ' prefix
                const runResponse: Partial<TModel> = JSON.parse(text);
                if (runResponse.error) {
                  runResponse.status = "STOPPED";
                }
                callback(runResponse, signalController);
                controller.enqueue(value);
                push();
              });
            } catch (error: any) {
              models.length && callback({ ...models[0], status: "STOPPED", error: `${error.message ? error.message : error}` }, signalController);
              controller.error(error);
            }
          }
          push();
        },
      });
    });
};

export const stopModel = async (model: TModel) => {
  const response = await localClient.post("/stop", {
    id: model.id,
    instance: model.instance,
  });
  return response.data;
};

export const deleteModel = async (model: TModel) => {
  const response = await localClient.delete(`/${model.id}`);
  return response.data;
};

export const getMyModels = async (): Promise<TModel[]> => {
  const response = await localClient.get("/downloaded");
  return response.data;
};

/** Remote API Calls */

export const searchModels = async (query: string): Promise<TModel[]> => {
  const response = await client.get(`/search/?query=${query}&k=500`);
  return response.data;
};

export const getModel = async (id: string): Promise<TModel> => {
  const response = await client.get(`/${id}`);
  return response.data;
};

export const getPrediction = async (input: string) => {
  const response = await client.get(`/autocomplete/?query=${input}`);
  return response.data;
};

/** Model running Calls */
export const getCompletions = async (model: TModel, prompt: string, settings?: Settings, onChunk?: any) => {
  const response = await fetch(`http://localhost:${model.port}/v1/completions`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
      stream: true,
      temperature: settings?.temperature,
      max_tokens: settings?.maxTokens,
      top_p: settings?.topP,
      frequency_penalty: settings?.frequencyPenalty,
      presence_penalty: settings?.presencePenalty,
    }),
  });
  const reader = response?.body?.getReader();
  const decoder = new TextDecoder();

  while (true && reader) {
    const { value } = await reader.read();

    const chunk = decoder.decode(value).substring(6).trim();
    if (chunk.includes("data: [DONE]") || chunk.includes("[DONE]")) {
      const ret = chunk.split("\n").filter((line) => !line.includes("data: ") && line.length > 0);
      for (const line of ret) {
        const data = JSON.parse(line);
        onChunk && onChunk(data);
      }
      return 'DONE';
    }

    const data = JSON.parse(chunk);
    onChunk && onChunk(data);
  }
};
