import { Recipe } from '@yourkitchen/models'
import { createOne, NetworkResponse, query, updateOne } from '..'

export const recipeById = async (id: string): Promise<Recipe | null> => {
  return await query<Recipe>(
    'recipeById',
    [
      '_id',
      'name',
      'description',
      'steps',
      'rating',
      'image',
      'persons',
      'cuisine',
      { ingredients: ['_id', 'name', 'unit', 'amount'] },
      { owner: ['name', 'image', 'ID'] },
      { preparationTime: ['hours', 'minutes'] },
    ],
    { _id: { value: id, type: 'MongoID!' } },
  )
}

export const recipeMany = async ({
  fields,
  filter,
}: {
  fields?: any[]
  filter?: { [key: string]: any }
}): Promise<Recipe[]> => {
  return (
    (await query<Recipe[]>(
      'recipeFindMany',
      fields || [
        '_id',
        'name',
        'steps',
        'rating',
        'image',
        { owner: ['name', 'image', 'ID'] },
      ],
      filter
        ? { filter: { value: filter, type: 'FilterFindManyrecipesInput' } }
        : undefined,
    )) || []
  )
}

export const recipeUpdateById = async (
  id: string,
  value: Partial<Recipe>,
  fields?: any[],
): Promise<Recipe | null> => {
  return (
    (
      await updateOne<Recipe>(
        'recipe',
        value,
        fields || [
          '_id',
          'name',
          'steps',
          'rating',
          'image',
          { owner: ['name', 'image', 'ID'] },
        ],
        { filter: { _id: { value: id, type: 'MongoID!' } } },
      )
    ).record || null
  )
}

export const recipeRandom = async (fields?: any[]): Promise<Recipe | null> => {
  const result = await query<Recipe>(
    'recipeRandom',
    fields || ['name', '_id', 'image', 'description', 'ownerId', 'rating'],
  )
  return result
}

export const recipeManyRandom = async (
  previous: string[] = [],
  cuisine?: string,
  filters?: {
    preference?: string
    ingredients?: number
    rating?: number
    preparationTime?: { hours: number; minutes: number }
  },
): Promise<Recipe[]> => {
  if (filters) {
    const requestFilters: {
      [key: string]: any
    } = {
      previous: { value: previous, type: '[String]!' },
    }
    if (filters.ingredients) {
      requestFilters.ingredients = filters.ingredients
    }
    if (filters.preparationTime?.hours && filters.preparationTime?.minutes) {
      requestFilters.preparationTimeHours = filters.preparationTime.hours
      requestFilters.preparationTimeMinutes = filters.preparationTime.minutes
    }
    if (cuisine) {
      requestFilters.cuisine = cuisine
    }

    const results = await query<Recipe[]>(
      'recipeManyRandom',
      [
        'name',
        '_id',
        'image',
        'description',
        'ownerId',
        'rating',
        'preference',
      ],
      requestFilters,
    )
    // Calculated fields have to be removed client side
    let edit = results || []
    if (filters.preference !== undefined) {
      edit = edit.filter((recipe) => {
        if (filters.preference === 'vegan') {
          return recipe.preference === 'vegan'
        } else if (filters.preference === 'vegetarian') {
          return (
            recipe.preference === 'vegan' || recipe.preference === 'vegetarian'
          )
        }
        return true
      })
    }
    if (filters && filters.rating !== undefined && filters.rating !== 0) {
      edit = edit.filter((recipe) => {
        return recipe.rating >= (filters.rating || 5)
      })
    }
    return edit
  } else {
    const results = await query<Recipe[]>(
      'recipeManyRandom',
      ['name', '_id', 'image', 'description', 'ownerId', 'rating'],
      {
        previous: { value: previous, type: '[String]!' },
        cuisine,
      },
    )
    return results || []
  }
}

export const recipePagination = async (
  page: number,
  userId: string,
): Promise<{
  items: Recipe[]
  pageInfo: { hasNextPage: boolean }
} | null> => {
  const response = await query<{
    items: Recipe[]
    pageInfo: { hasNextPage: boolean }
  }>(
    'recipePagination',
    [
      {
        pageInfo: ['hasNextPage'],
      },
      {
        items: ['name', 'image', '_id'],
      },
    ],
    {
      page: page,
      filter: {
        value: { ownerId: userId },
        type: 'FilterFindManyrecipesInput',
      },
    },
  )
  return response
}

export const recipeCreateOne = async (
  value: Partial<Recipe>,
): Promise<NetworkResponse<Recipe>> => {
  return await createOne<Recipe>('recipe', value, [
    '_id',
    'image',
    'name',
    'persons',
    { preparationTime: ['hours', 'minutes'] },
    'rating',
    'cuisine',
    'description',
    'recipeType',
    'ownerId',
  ])
}
