import { MealPlan, User } from '@yourkitchen/models'
import * as gql from 'gql-query-builder'
import { api, NetworkResponse, query, updateOne } from '..'

export const mealplanOne = async (user: User): Promise<MealPlan | null> => {
  return query<MealPlan>(
    'mealplanOne',
    [
      {
        meals: ['recipes', 'date'],
      },
    ],
    {
      filter: {
        value: { ownerId: user.ID },
        type: 'FilterFindOnemealplansInput',
      },
    },
  )
}

export const mealplanUpdate = async (
  mealplan: Partial<MealPlan>,
  fields?: any[],
): Promise<NetworkResponse<MealPlan>> => {
  // Remove rating from mealplan (Server updated)
  const tmpMealplan = {
    ...mealplan,
    meals: mealplan.meals?.map((meal) => {
      Object.keys(meal.recipes).forEach((mealType) => {
        meal.recipes[mealType] = meal.recipes[mealType].map((recipe) => {
          const tmpRecipe: any = recipe

          delete tmpRecipe.owner
          delete tmpRecipe.rating

          return tmpRecipe
        })
      })
      return meal
    }),
  }
  return updateOne<MealPlan>(
    'mealplan',
    tmpMealplan,
    fields || [
      {
        meals: ['recipes', 'date'],
      },
    ],
  )
}

export const mealplanCreate = async (): Promise<MealPlan | null> => {
  return new Promise(async (resolve, reject) => {
    const response = await api.post(
      '/graphql',
      gql.mutation({
        operation: 'mealplanCreateOne',
        fields: [{ meals: ['recipes', 'date'] }],
      }),
    )
    if (response.data?.errors?.[0]?.message) {
      return reject(response.data?.errors?.[0]?.message)
    }
    return resolve(
      response.data?.data?.mealplanCreateOne
        ? response.data?.data?.mealplanCreateOne
        : undefined,
    )
  })
}
