import { FeedItem } from '@yourkitchen/models'
import { createOne, NetworkResponse, query } from '..'

export const feeditemMany = async (): Promise<FeedItem[]> => {
  return (
    (await query<FeedItem[]>('feeditemMany', [
      '_id',
      'description',
      'rating',
      { recipe: ['_id', 'name', 'steps', 'rating', 'image'] },
      { owner: ['name', 'ID', 'image'] },
      'created_at',
      'updated_at',
    ])) || []
  )
}

export const feeditemCreateOne = async (
  value: Partial<FeedItem>,
): Promise<NetworkResponse<FeedItem>> => {
  return await createOne<FeedItem>('feeditem', value)
}
