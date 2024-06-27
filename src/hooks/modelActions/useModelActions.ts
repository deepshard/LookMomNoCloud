import { useDeleteModel, useStopModel } from "../../lib/react-query/queriesAndMutations";
import { startInstallModel, startRunModels } from "../../api/model";
import { TModel } from "../../types/schemas";

const useModelActions = () => {
  const installStreamControllers: { [key: string]: AbortController } = {};

  const {mutateAsync: startStopModel } = useStopModel()
  const {mutateAsync: startDeleteModel } = useDeleteModel()

  const installModel = async (model: TModel, controller = new AbortController(), callback: (response: Partial<TModel>) => void) => {
    installStreamControllers[model.id] = controller;
    startInstallModel(model, controller.signal, callback).catch((err) => {
      console.error("install error:", err);
      callback({ ...model, status: "NOT_DOWNLOADED", error: `${err.message ? err.message : err}` });
    });
  };

  const runModels = async (models: TModel[], controller = new AbortController(), callback: (response: Partial<TModel>, controller: AbortController) => void) => {
    startRunModels(models, controller, callback).catch((err) => {
      console.error("Run model error:", err);
      callback({ ...models[0], status: "STOPPED", error: `${err.message ? err.message : err}` }, controller);
    });
  };

  const stopModel = async (model: TModel) => {
    return startStopModel(model).catch((err) => console.error("Stop model error:", err));
  };

  const deleteModel = async (model: TModel) => {
    return startDeleteModel(model).catch((err) => console.error("Delete model error:", err));
  };

  const retry = async (model: TModel, callback: (response: Partial<TModel>) => void) => {
    switch (model.status) {
      case "NOT_DOWNLOADED":
        installModel(model, undefined, callback);
        break;

      case "STOPPED":
        runModels([model], undefined, callback);
        break;

      default:
        break;
    }
  };

  const cleanupInstall = (model: TModel) => {
    installStreamControllers[model.id]?.abort();
    delete installStreamControllers[model.id];
  };

  return { installModel, runModels, stopModel, deleteModel, cleanupInstall, retry };
};

export default useModelActions;
