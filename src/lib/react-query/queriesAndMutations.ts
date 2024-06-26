import { useMutation, useQuery } from "@tanstack/react-query";
import { getHighlights } from "../../api/general";
import { deleteModel, getMyModels, getModel, searchModels, stopModel, getPrediction } from "../../api/model";
import { TModel } from "../../types/schemas";

export const useGetHighlights = () => {
  return useQuery({
    queryKey: ["highlights"],
    queryFn: () => getHighlights(),
    retry: 3,
    retryOnMount: false,
  });
};

export const useStopModel = () => {
  return useMutation({
    mutationFn: (model: TModel) => {
      return stopModel(model);
    },
  })
}

export const useDeleteModel = () => {
  return useMutation({
    mutationFn: (model: TModel) => {
      return deleteModel(model);
    },
  })
}

export const useSearchModels = (query: string) => {
  return  useQuery({
    queryKey: ["searchModels", query],
    queryFn: () => {
      return searchModels(query)
    },
    retryOnMount: false,
    enabled: !!query
  })
}

export const useGetMyModels = () => {
  return useQuery({
    queryKey: ["myModels"],
    queryFn: () => {
      return getMyModels()
    },
  })
}

export const useGetModel = (model?: Partial<TModel> | null) => {

  if(!model) {
    throw new Error("Model ID is required")
  }
  return useQuery({
    queryKey: ["model", model.id],
    queryFn: () => {
      return getModel(model.id as string)
    },
  })
}

export const useGetPrediction = (text: string) => {
  return useQuery({
    queryKey: ["search-prediction", text],
    queryFn: () => {
      return getPrediction(text)
    }
  })
};
