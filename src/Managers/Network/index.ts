import * as gql from 'gql-query-builder'
import axios from 'axios'

type VariableOptions =
  | {
      type?: string
      name?: string
      value: any
      list?: boolean
      required?: boolean
    }
  | {
      [k: string]: any
    }

export interface NetworkResponse<T = any> {
  errors?: [{ message: string }]
  error?: { message: string }
  recordId?: string
  record?: T
}

export const query = <T>(
  operationName: string,
  fields?: any[],
  variables?: VariableOptions,
): Promise<T | null> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post(
        '/graphql',
        gql.query({
          operation: operationName,
          fields,
          variables,
        }),
      )

      const json = await response.data
      if (json.errors !== undefined) {
        return reject(json.errors[0].message)
      }
      const data = json.data?.[operationName] // Get the data of the operation
      resolve(data as T | null)
    } catch (error: any) {
      return reject(error.text ? await error.data : error)
    }
  })
}

export const createOne = <T>(
  type: string,
  record?: Partial<T>,
  fields?: any[],
): Promise<NetworkResponse<T>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const responseData = await api.post(
        '/graphql',
        gql.mutation({
          operation: `${type}CreateOne`,
          fields: fields
            ? ['recordId', { error: ['message'] }, { record: fields }]
            : ['recordId', { error: ['message'] }],
          variables: record && {
            record: { value: record, type: `CreateOne${type}sInput!` },
          },
        }),
      )
      const json = await responseData.data
      if (json.errors !== undefined) {
        return reject(json.errors[0].message)
      }
      const data = json.data?.[`${type}CreateOne`]
      if (data.recordId) {
        resolve(data as NetworkResponse<T>)
      } else {
        resolve({ record: data } as NetworkResponse<T>)
      }
    } catch (error) {
      return reject(error)
    }
  })
}

export const updateOne = <T>(
  type: string,
  record: Partial<T>,
  fields?: any[],
  variables?: VariableOptions,
): Promise<NetworkResponse<T>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const responseData = await api.post(
        '/graphql',
        gql.mutation({
          operation: `${type}UpdateOne`,
          fields: fields
            ? ['recordId', { error: ['message'] }, { record: fields }]
            : ['recordId', { error: ['message'] }],
          variables: {
            ...variables,
            record: { value: record, type: `UpdateOne${type}sInput!` },
          },
        }),
      )
      const json = await responseData.data
      if (json.errors !== undefined) {
        return reject(json.errors[0].message)
      }
      const data = json.data?.[`${type}UpdateOne`]
      resolve(data)
    } catch (error) {
      return reject(error)
    }
  })
}

const API_URL =
  process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000'
    : 'https://api.yourkitchen.io'
const AUTH_URL =
  process.env.NODE_ENV === 'DEV' || process.env.NODE_ENV === 'development'
    ? 'http://localhost:2525'
    : 'https://auth.yourkitchen.io'

export const getImageUrl = (
  filename: string | undefined,
  size?: { width?: number; height?: number },
): string => {
  if (filename?.startsWith('http')) {
    return filename || ''
  }
  let sizeString = ''
  if (size) {
    if (size.width && size.height) {
      sizeString = `?width=${size.width}&height=${size.height}`
    } else if (size.width) {
      sizeString = `?width=${size.width}`
    } else if (size.height) {
      sizeString = `?height=${size.height}`
    }
  }
  return `${api.defaults.baseURL}/files/${filename || ''}${sizeString}`
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const removeId = (obj: any): any => {
  delete obj._id
  return obj
}
axios.defaults.validateStatus = function () {
  return true
}

export const auth = axios.create({
  withCredentials: true,
  responseType: 'json',
  baseURL: AUTH_URL,
})

export const api = axios.create({
  withCredentials: true,
  responseType: 'json',
  baseURL: API_URL,
})

api.interceptors.response.use(undefined, (err) => Promise.reject(err))
