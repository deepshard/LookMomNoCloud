import { useMutation, useQuery } from "@tanstack/react-query";
import { getHighlights } from "../../api/general";
import { deleteModel, stopModel } from "../../api/model";
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
