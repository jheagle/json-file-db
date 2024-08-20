import { keyReference } from './keyReference'

describe('keyReference', () => {
  test('can generate a reference', () => {
    const reference = { fields: ['exercises._id'], lookup: 'exercises.json' }
    expect(keyReference(reference)).toEqual(reference)
  })
})
