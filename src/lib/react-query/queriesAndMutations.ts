import { useQuery } from "@tanstack/react-query";
import { getHighlights } from "../../api/general";

export const useGetHighlights = () => {
  return useQuery({
    queryKey: ["highlights"],
    queryFn: () => getHighlights(),
    retry: 3,
    retryOnMount: false,
  });
};
