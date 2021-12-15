import { Rating } from '@yourkitchen/models'
import { shuffle } from '../../../Utils'
import { createOne, query, updateOne } from '..'

/**
 * Used to update a rating in the database
 * @param value The value (1-5)
 * @param recipeId The recipe being rated
 * @param user The user ID, only used to search documents, it won't override anything
 * @returns The updated rating
 */
export const updateRating = async (item: Partial<Rating>): Promise<Rating> => {
  if (!item || !item.value) {
    console.error(item)
    throw new Error('Rating not supplied')
  }
  if (item.messageId === undefined && (item.value < 0 || item?.value > 5)) {
    throw new Error(`Rating value out of range: ${item.value}`)
  } else if (!!item.messageId && (item.value < 0 || item?.value > 1)) {
    // Rating between 0 and 1 for message
    throw new Error(`Rating value out of range: ${item.value}`)
  }
  // Parse as string, for some reason this can sometimes be an error
  item.value = Number.parseInt(item.value.toString())
  const fields = ['_id', 'recipeId', 'messageId', 'message', 'ownerId', 'value']
  const document = await query<Rating>('ratingFindOne', fields, {
    filter: {
      value: {
        recipeId: item.recipeId,
        ownerId: item.ownerId,
        messageId: item.messageId,
      },
      type: 'FilterFindOneratingsInput',
    },
  })
  // Delete fields that are supplied on the server
  delete item._id
  delete item.ownerId
  delete item.owner
  if (document) {
    // Update if already exists
    const updateResponse = await updateOne<Rating>('rating', item, fields, {
      filter: {
        value: {
          recipeId: item.recipeId,
          ownerId: item.ownerId,
          messageId: item.messageId,
        },
        type: 'FilterUpdateOneratingsInput',
      },
    })
    if (updateResponse.record) {
      return updateResponse.record
    }
  } else {
    // Create if doesn't exist
    const createResponse = await createOne<Rating>('rating', item, fields)
    if (createResponse.record) {
      return createResponse.record
    }
  }
  throw new Error('Something went wrong when updating the rating')
}

/**
 * Finds the rating for a recipe
 * @param recipeId
 * @param userId
 * @returns
 */
export const findRating = async (
  recipeId: string,
  userId: string,
): Promise<Rating | null> => {
  return await query<Rating>(
    'ratingFindOne',
    ['_id', 'recipeId', 'messageId', 'message', 'ownerId', 'value'],
    {
      filter: {
        value: { recipeId: recipeId, ownerId: userId, messageId: undefined },
        type: 'FilterFindOneratingsInput',
      },
    },
  )
}

/**
 * Review object consists of comments, ratings of the comments and all the ratings that we own for the given recipe
 * @param recipeId The id of the recipe to filter on
 * @param ownUserId the users own ID, used to find own array
 * @returns A list of ratings that have messages
 */
export const reviewFindMany = async (
  recipeId: string,
  ownUserId: string,
): Promise<{ comments: Rating[]; commentRatings: Rating[]; own: Rating[] }> => {
  const ratingsData = await query<Rating[]>(
    'ratingFindMany',
    [
      '_id',
      'value',
      'message',
      'recipeId',
      { owner: ['ID', 'name', 'image'] },
      'createdAt',
    ],
    {
      filter: { value: { recipeId }, type: 'FilterFindManyratingsInput' },
    },
  )
  return {
    comments: shuffle(ratingsData?.filter((rating) => !!rating.message) || []),
    commentRatings: ratingsData?.filter((rating) => !!rating.messageId) || [],
    own: ratingsData?.filter((rating) => rating.ownerId === ownUserId) || [],
  }
}

export const ratingInfo = async (
  recipeId: string,
): Promise<{ count: number; max: number; min: number } | null> => {
  const ratingsData = await query<Rating[]>('ratingFindMany', ['value'], {
    filter: { value: { recipeId }, type: 'FilterFindManyratingsInput' },
  })
  return ratingsData
    ? {
        count: ratingsData.length,
        min: ratingsData?.reduce(
          (prev, cur) => (prev > cur.value ? cur.value : prev),
          5,
        ),
        max: ratingsData.reduce(
          (prev, cur) => (prev < cur.value ? cur.value : prev),
          0,
        ),
      }
    : ratingsData
}
