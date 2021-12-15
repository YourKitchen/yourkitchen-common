import { Interest } from '@yourkitchen/models'
import { createOne, query, updateOne } from '..'

export const updateInterest = async ({
  likes,
  ratings,
}: {
  likes?: { [key: string]: number }
  ratings?: { [key: string]: number }
}): Promise<Interest | undefined> => {
  return new Promise(async (resolve, reject): Promise<void> => {
    const interestResponse = await query<Interest>('interestFindOwn', [
      '_id',
      'likes',
      'ratings',
    ])
    if (interestResponse) {
      // Combine new object with the old one
      const newObject: {
        likes?: { [key: string]: number }
        ratings?: { [key: string]: number }
      } = {
        likes: likes
          ? Object.keys(likes).reduce(
              (prev, cur) => ({
                ...prev,
                [cur]: prev[cur] ? (prev[cur] += likes[cur]) : likes[cur],
              }),
              interestResponse.likes,
            )
          : interestResponse.likes,
        ratings: ratings
          ? Object.keys(ratings).reduce(
              (prev, cur) => ({
                ...prev,
                [cur]: prev[cur] ? (prev[cur] += ratings[cur]) : ratings[cur],
              }),
              interestResponse.ratings,
            )
          : interestResponse.ratings,
      }
      // No need to specify ID as we can only update our own
      const interestUpdateResponse = await updateOne<Interest>(
        'interest',
        newObject,
        ['_id', 'likes', 'ratings'],
      )
      if (interestUpdateResponse.error) {
        return reject(interestUpdateResponse.error)
      }
      return resolve(interestUpdateResponse.record)
    } else {
      // Create interest
      const interestCreateResponse = await createOne<Interest>(
        'interest',
        {
          likes: likes || {},
          ratings: ratings || {},
        },
        ['_id', 'likes', 'ratings'],
      )
      if (interestCreateResponse.error) {
        return reject(interestCreateResponse.error)
      }
      return resolve(interestCreateResponse.record)
    }
  })
}
