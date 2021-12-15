import { Ingredient } from '@yourkitchen/models'
import { createOne, NetworkResponse, query } from '..'

export const ingredientsMany = async (limit = 100): Promise<Ingredient[]> => {
  return (
    (await query<Ingredient[]>(
      'ingredientFindMany',
      ['name', 'unit', 'type', '_id'],
      { limit: limit },
    )) || []
  )
}

export const ingredientCreateOne = async (
  value: Partial<Ingredient>,
): Promise<NetworkResponse<Ingredient>> => {
  return await createOne<Ingredient>('ingredient', value, [
    '_id',
    'name',
    'type',
    'allergenType',
    'ownerId',
  ])
}
