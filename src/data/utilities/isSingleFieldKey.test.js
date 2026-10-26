import { isSingleFieldKey } from './isSingleFieldKey'

describe('isSingleFieldKey', () => {
  test('is true only for a key on exactly that one field', () => {
    expect(isSingleFieldKey({ type: 'index', fields: ['x'], lookup: 'index_x.json' }, 'x')).toBe(true)
    expect(isSingleFieldKey({ type: 'index', fields: ['x', 'y'], lookup: 'index_x_y.json' }, 'x')).toBe(false)
    expect(isSingleFieldKey({ type: 'index', fields: ['x', 'y'], lookup: 'index_x_y.json' }, 'y')).toBe(false)
    expect(isSingleFieldKey({ type: 'index', fields: ['y'], lookup: 'index_y.json' }, 'x')).toBe(false)
  })
})
