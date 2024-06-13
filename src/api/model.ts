import { TModel } from "../types/schemas";
import { ROOTURL } from "./client";

export const startInstallModel = async (model: TModel, signal: AbortSignal, callback: (response: Partial<TModel>) => void) => {
    return fetch(ROOTURL + "/model/install", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
            url: model.hf_link,
            id: model.id
        }),
        signal: signal
    }).then(response => {
        if(!response.ok) {
          throw new Error(response.statusText);
        }
        return response
    })
    .then((response) => {
        const reader = response?.body?.getReader();
        return new ReadableStream({
          start(controller) {
            function push() {
              // Read from the stream
              reader?.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }
                // Decode and process the chunk
                const text = (new TextDecoder().decode(value)).substring(6).trim(); // will remove the 'data: ' prefix
                const downloadResponse: Partial<TModel> = JSON.parse(text);
                callback(downloadResponse)
                controller.enqueue(value);
                push();
              });
            }
            push();
          }
        });
      })
}