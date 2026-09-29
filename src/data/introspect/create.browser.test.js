// Simulates exactly what the browser bundle produces: build-tools.config.json's browser.ignore
// replaces 'fs' and 'fs/promises' with an empty object, since a real browser has no filesystem.
// Write functions stay present in the bundle (same public API shape) but throw if actually called
// there - confirmed as the intended behavior, rather than failing to bundle at all.
jest.mock('fs/promises', () => ({}))
jest.mock('fs', () => ({}))

import { create } from './create'

describe('create (browser)', () => {
  test('throws instead of silently doing nothing when fs is unavailable', async () => {
    await expect(create('foo', [], [])).rejects.toThrow(/is not a function/)
  })
})
