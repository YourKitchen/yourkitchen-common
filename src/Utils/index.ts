import { Ingredient } from '@yourkitchen/models'
import axios from 'axios'
import { Buffer } from 'buffer'

export const mergeIngredients = (
  ingredientsA: Ingredient[],
  ingredientsB: Ingredient[],
): Ingredient[] => {
  if (!ingredientsA || !ingredientsB) {
    throw new Error('mergeIngredients: Ingredients array not set')
  }
  const tmpIngredients = ingredientsA
  ingredientsB.forEach((valueB) => {
    const find = tmpIngredients.findIndex((valueA) => valueA._id === valueB._id)
    if (find !== -1) {
      // If not found
      if (!tmpIngredients[find].amount) {
        tmpIngredients[find].amount = 0
      }
      if (tmpIngredients[find].amount && valueB.amount) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        tmpIngredients[find].amount! += valueB.amount // ammount is forced, because it cannot be undefined. See above
      }
    } else {
      // If id not found, just add it
      tmpIngredients.push(valueB)
    }
  })
  return tmpIngredients
}

export const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

export const getBase64 = async (url: string): Promise<string> => {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
  })
  return Buffer.from(response.data, 'binary').toString('base64')
}

export const shuffle = (array: any[]): any[] => {
  let currentIndex = array.length
  let randomIndex: number

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

export default mergeIngredients
