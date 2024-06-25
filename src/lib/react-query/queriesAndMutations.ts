import { useMutation, useQuery } from "@tanstack/react-query";
import { getHighlights, getNews } from "../../api/general";
import { deleteModel, getMyModels, getModel, searchModels, stopModel } from "../../api/model";
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

export const useGetNews = () => {
  const dummyNewsData = Array.from({ length: 3 }, (_, index) => ({
    id: `id-${index + 1}`,
    title: `News Title ${index + 1}`,
    content: `This is the content for news item ${index + 1}. Here's some more detailed information about the news event.`,
    imageUrl: index % 3 === 0 ? `https://example.com/image${index + 1}.jpg` : undefined,
    userProfilePicture: `/src/assets/images/llama1.png`,
    URL: `https://example.com/news/${index + 1}`,
    createdAt: new Date().toISOString(),
  }));
  return useQuery({
    queryKey: ["models-news"],
    queryFn: () => {
      return getNews()
    },
    refetchOnWindowFocus: false,
    initialData: dummyNewsData
  })
}
