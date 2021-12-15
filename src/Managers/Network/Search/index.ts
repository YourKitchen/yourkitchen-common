import { query } from '..'
import { SearchResult, SearchType } from '@yourkitchen/models'

export const search = async (
  searchText: string,
  types: SearchType[] | SearchType = [],
): Promise<SearchResult[]> => {
  const typeArray = (Array.isArray(types) ? types : [types]) as string[]
  const searchResults = await query<SearchResult[]>(
    'search',
    ['_id', 'name', 'type', 'image'],
    {
      message: searchText,
      types: { value: typeArray, type: '[String]!' },
    },
  )
  return searchResults || []
}
