import { User } from '@yourkitchen/models'
import { mutation } from 'gql-query-builder'
import { api, auth, createOne, NetworkResponse } from '../'
import { query } from '..'
import * as gql from 'gql-query-builder'

export const userFindOne = async (id: string): Promise<User | null> => {
  return query<User | null>(
    'userFindOne',
    ['name', 'ID', 'image', 'following', 'followers', 'tokens', 'score'],
    { filter: { value: { ID: id }, type: 'FilterFindOneusersInput!' } },
  )
}

export const userCount = async (): Promise<number> => {
  return (await query<number>('userCount')) || 0
}

export const userPagination = async (page: number): Promise<User[]> => {
  const response = await query<{ items: User[] }>(
    'userPagination',
    [
      {
        items: [
          'name',
          'ID',
          'email',
          'image',
          'following',
          'followers',
          'score',
          'role',
        ],
      },
    ],
    { page: page, perPage: 25 },
  )
  return response?.items || []
}

export const userOwn = async (): Promise<User | null> => {
  return query<User | null>('me', [
    'ID',
    'allergenes',
    'defaultPersons',
    'name',
    'email',
    'following',
    'followers',
    'image',
    'tokens',
    { privacySettings: ['mealplan', 'consent', 'adConsent'] },
    { notificationSettings: ['mealplanFrequency'] },
    'score',
    'role',
    'timezone',
  ])
}

export const userUpdateFollowing = async (id: string): Promise<User | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post(
        '/graphql',
        mutation({
          operation: 'userUpdateFollowing',
          variables: { ID: id },
          fields: [
            'ID',
            'allergenes',
            'defaultPersons',
            'name',
            'email',
            'following',
            'followers',
            'image',
            'tokens',
            { privacySettings: ['mealplan', 'consent', 'adConsent'] },
            { notificationSettings: ['mealplanFrequency'] },
            'score',
            'timezone',
          ],
        }),
      )
      if (response.data?.errors?.[0]?.message) {
        return reject(response.data?.errors?.[0]?.message)
      }
      const data = response.data?.data?.userUpdateFollowing
      resolve(data || null)
    } catch (err) {
      reject(err)
    }
  })
}

export const userDeleteOwn = async (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Delete all users created data
      const deleteResponse = await Promise.all([
        api.post<NetworkResponse>(
          '/graphql',
          gql.mutation({
            operation: 'claimrequestRemoveOwn',
            fields: [{ error: ['message'] }],
            variables: {
              filter: {
                value: { ownerId: '' }, // Value does not matter, it is set serverside (This is just to prevent error)
                type: 'FilterRemoveManyclaimrequestsInput!',
              },
            },
          }),
        ),
        api.post<NetworkResponse>(
          '/graphql',
          gql.mutation({
            operation: 'kitchenRemoveOwn',
            fields: [{ error: ['message'] }],
          }),
        ),
        api.post<NetworkResponse>(
          '/graphql',
          gql.mutation({
            operation: 'mealplanRemoveOne',
            fields: [{ error: ['message'] }],
          }),
        ),
        api.post<NetworkResponse>(
          '/graphql',
          gql.mutation({
            operation: 'feeditemRemoveMany',
            fields: [{ error: ['message'] }],
            variables: {
              filter: {
                value: { ownerId: '' }, // Value does not matter, it is set serverside (This is just to prevent error)
                type: 'FilterRemoveManyfeeditemsInput!',
              },
            },
          }),
        ),
        api.post<NetworkResponse>(
          '/graphql',
          gql.mutation({
            operation: 'ratingRemoveMany',
            fields: [{ error: ['message'] }],
            variables: {
              filter: {
                value: { ownerId: '' }, // Value does not matter, it is set serverside (This is just to prevent error)
                type: 'FilterRemoveManyratingsInput!',
              },
            },
          }),
        ),
      ])
      // Get all responses
      const errorMessages = deleteResponse
        .map((val) =>
          val.data.error
            ? [val.data.error?.message]
            : val.data.errors
            ? val.data.errors.map((error) => error.message)
            : [],
        )
        .flat(1)
        .filter((val) => val !== '')
      if (errorMessages.length > 0) {
        errorMessages.forEach(console.error) // Log all the errors
        throw new Error(errorMessages[0]) // Only throw the first error
      }
      const deleteApiResponse = await api.post<NetworkResponse>(
        '/graphql',
        gql.mutation({
          operation: 'userRemoveOne',
          fields: [{ error: ['message'] }],
        }),
      )
      const data = deleteApiResponse.data
      if (data.error && data.error?.message) {
        throw new Error(data.error.message)
      }
      const deleteAuthResponse = await auth.post('/deleteMe')
      if (deleteAuthResponse.data.ok === 0) {
        throw new Error(deleteAuthResponse.data.message)
      }
      return resolve(deleteAuthResponse.data)
    } catch (err) {
      reject(err)
    }
  })
}

export const userCreateOne = async (
  user: Partial<User>,
): Promise<NetworkResponse<User>> => {
  const tmpUser: any = user
  console.log('Deleting old user')
  // Delete old values
  delete tmpUser.created_at
  delete tmpUser.updated_at
  return await createOne<User>('user', tmpUser, [
    'ID',
    'allergenes',
    'defaultPersons',
    'name',
    'email',
    'following',
    'image',
    { privacySettings: ['mealplan', 'consent', 'adConsent'] },
    { notificationSettings: ['mealplanFrequency'] },
    'score',
    'tokens',
    'timezone',
  ])
}
