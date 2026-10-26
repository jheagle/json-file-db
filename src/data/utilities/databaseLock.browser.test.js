// In the browser nothing can be written (see create.browser.test.js), so the lock lets tasks run at once
jest.mock('browser-or-node', () => ({ isNode: false, isBrowser: true }))

import { withDatabaseLock } from './databaseLock'

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('withDatabaseLock (browser)', () => {
  test('does not queue tasks', async () => {
    const events = []
    await Promise.all([
      withDatabaseLock(async () => { await wait(20); events.push('slow') }),
      withDatabaseLock(async () => { events.push('fast') })
    ])
    expect(events).toEqual(['fast', 'slow'])
  })
})
