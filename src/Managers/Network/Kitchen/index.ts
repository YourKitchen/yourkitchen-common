import { Kitchen } from '@yourkitchen/models'
import VariableOptions from 'gql-query-builder/build/VariableOptions'
import { createOne, NetworkResponse, query, updateOne } from '..'

export const kitchenOwn = async (): Promise<Kitchen | null> => {
  return query<Kitchen>('kitchenOwn', [
    '_id',
    {
      refrigerator: [
        'count',
        'name',
        'unit',
        'amount',
        'type',
        'ownerId',
        '_id',
      ],
    },
    {
      shoppinglist: [
        'count',
        'name',
        'unit',
        'amount',
        'type',
        'ownerId',
        '_id',
      ],
    },
    { owner: ['name', 'ID'] },
    { shared: ['name', 'image', 'ID'] },
  ])
}

export const kitchenOne = async (
  variables: VariableOptions,
): Promise<Kitchen | null> => {
  return query<Kitchen>(
    'kitchenOne',
    [
      '_id',
      {
        refrigerator: [
          'count',
          'name',
          'unit',
          'amount',
          'type',
          'ownerId',
          '_id',
        ],
      },
      {
        shoppinglist: [
          'count',
          'name',
          'unit',
          'amount',
          'type',
          'ownerId',
          '_id',
        ],
      },
      { owner: ['name', 'ID'] },
      { shared: ['name', 'image', 'ID'] },
    ],
    variables,
  )
}

export const updateKitchen = async (
  kitchen: Partial<Kitchen>,
  fields?: any[],
): Promise<Kitchen | null> => {
  const tmpKitchen: any = {
    refrigerator: kitchen.refrigerator,
    shoppinglist: kitchen.shoppinglist,
    shared: kitchen.shared?.map((user) => user.ID),
  }
  const responseData = await updateOne<Kitchen>('kitchen', tmpKitchen, fields)
  const record = responseData.record
  return record || null
}

export const kitchenCreateOne = async (): Promise<NetworkResponse<Kitchen>> => {
  return await createOne<Kitchen>('kitchen', {
    refrigerator: [],
    shoppinglist: [],
    shared: [],
  })
}
