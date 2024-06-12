import { TModel } from "../../types/schemas"


interface InstallModelHookProps {
  streamFn?: (...args: any) => Promise<ReadableStream<any>>
}

const useInstallModel = ({streamFn: startInstallModelCall}: InstallModelHookProps = {}) => {
  let streamController: AbortController | null = null;


    const installModel = async (model: TModel, controller = new AbortController(), callback: (response: Partial<TModel>) => void) => {
      streamController = controller
      startInstallModelCall && startInstallModelCall(model, controller.signal, callback)
        .catch(err => console.error('Fetch error:', err));
    }

    const disconnect = () => {
      streamController?.abort();
    }

    return { installModel, disconnect }
}

export default useInstallModel