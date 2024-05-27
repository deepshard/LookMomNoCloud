import { useQuery, useMutation } from '@tanstack/react-query'
import { getHighlights } from 'src/api/general'

export const useGetHighlights = () => {
    return useQuery({
        queryKey: ['highlights'],
        queryFn: () => getHighlights(),
    })
}