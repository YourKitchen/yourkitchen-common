import { ClaimRequest } from '@yourkitchen/models'
import { api, createOne, NetworkResponse, query } from '../'
import * as gql from 'gql-query-builder'

export const claimRequestFind = async (
  recipeId: string,
  ownerId: string,
): Promise<ClaimRequest | null> => {
  const response = await query<ClaimRequest>(
    'claimrequestFindOne',
    [
      '_id',
      'message',
      { recipe: ['_id', 'name', 'image'] },
      { owner: ['ID', 'name', 'image'] },
    ],
    {
      filter: {
        value: { recipeId, ownerId },
        type: 'FilterFindOneclaimrequestsInput',
      },
    },
  )
  return response
}

export const claimRequestFindMany = async (): Promise<ClaimRequest[]> => {
  const response = await query<ClaimRequest[]>('claimrequestFindMany', [
    '_id',
    'message',
    { recipe: ['_id', 'name', 'image'] },
    { owner: ['ID', 'name', 'image'] },
  ])
  return response || []
}

export const claimRequestCreateOne = async (
  value: Partial<ClaimRequest>,
): Promise<NetworkResponse<ClaimRequest>> => {
  const response = await createOne<ClaimRequest>('claimrequest', value, [
    '_id',
    'message',
    { recipe: ['_id', 'name', 'image'] },
    { owner: ['ID', 'name', 'image'] },
  ])
  return response
}

export const claimRequestRemoveById = async (
  id: string,
): Promise<NetworkResponse> => {
  const response = await api.post<NetworkResponse>(
    '/graphql',
    gql.mutation({
      operation: 'claimrequestRemoveById',
      fields: [{ error: ['message'] }],
      variables: { _id: { value: id, type: 'MongoID!' } },
    }),
  )
  const data = response.data
  if (data.error && data.error?.message) {
    throw new Error(data.error.message)
  }
  return data
}
