import { useStore } from "../../store/store";
import { ROOTURL } from "../../api/client";
import { TModel } from "../../types/schemas"

const useInstallModel = () => {

  const {setDownloads} = useStore();

    const controller = new AbortController();
    const { signal } = controller;

    const installModel = async (model: TModel) => {
        fetch(ROOTURL + "/model/install", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'text/event-stream',
            },
            body: JSON.stringify({
                url: model.url,
                id: model.id
            }),
            signal: signal
        }).then(response => {
            if(!response.ok) {
              throw new Error(response.statusText);
            }
            return response
        })
        .then(async (response) => {
          const reader = response.body.getReader();
          return new ReadableStream({
            start(controller) {
              function push() {
                // Read from the stream
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  // Decode and process the chunk
                  const text = (new TextDecoder().decode(value)).substring(6).trim(); // will remove the 'data: ' prefix
                  const downloadResponse: Partial<TModel> = JSON.parse(text);
                  setDownloads({
                    ...model,
                    ...downloadResponse
                  })
                  controller.enqueue(value);
                  push();
                });
              }
              push();
            }
          });
        })
        .catch(err => console.error('Fetch error:', err));
    }

    const disconnect = () => {
        controller.abort();
    }

    return { installModel, disconnect }
}

export default useInstallModel