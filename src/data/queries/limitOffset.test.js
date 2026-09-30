import { limitOffset } from './limitOffset'

describe('limitOffset', () => {
  const dataSet = [{ _id: 1 }, { _id: 2 }, { _id: 3 }, { _id: 4 }, { _id: 5 }]

  test('returns the dataSet unchanged when neither offset nor limit is given', () => {
    expect(limitOffset(dataSet, undefined, undefined)).toEqual(dataSet)
  })

  test('limit alone caps the number of rows from the start', () => {
    expect(limitOffset(dataSet, undefined, 2)).toEqual([{ _id: 1 }, { _id: 2 }])
  })

  test('offset alone skips that many rows from the start', () => {
    expect(limitOffset(dataSet, 3, undefined)).toEqual([{ _id: 4 }, { _id: 5 }])
  })

  test('offset and limit together page through the dataSet', () => {
    expect(limitOffset(dataSet, 1, 2)).toEqual([{ _id: 2 }, { _id: 3 }])
  })

  test('a limit larger than the remaining rows just returns what is left', () => {
    expect(limitOffset(dataSet, 3, 10)).toEqual([{ _id: 4 }, { _id: 5 }])
  })
})
