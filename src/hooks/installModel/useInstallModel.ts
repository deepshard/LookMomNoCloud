import { TModel } from "../../types/schemas"


interface InstallModelHookProps {
  streamFn?: (...args: any) => Promise<ReadableStream<any>>
}

const useInstallModel = ({streamFn: startInstallModelCall}: InstallModelHookProps = {}) => {
  // let streamController: AbortController | null = null;

  const streamControllers: { [key: string]: AbortController } = {}


  const installModel = async (model: TModel, controller = new AbortController(), callback: (response: Partial<TModel>) => void) => {
    streamControllers[model.id] = controller
    startInstallModelCall && startInstallModelCall(model, controller.signal, callback)
      .catch(err => console.error('Fetch error:', err));
  }

  const disconnect = (model: TModel) => {
    streamControllers[model.id]?.abort();
    delete streamControllers[model.id];
  }

  return { installModel, disconnect }
}

export default useInstallModel