import { configure, getSetting } from './config'

describe('config', () => {
  test('falls back to the given default when nothing has been configured', () => {
    expect(getSetting('databasePath', 'database/')).toBe('database/')
  })

  test('configure() overrides a setting for subsequent reads', () => {
    configure({ databasePath: 'my-data/' })
    expect(getSetting('databasePath', 'database/')).toBe('my-data/')
  })

  test('configure() only touches the settings it is given, leaving others alone', () => {
    configure({ databasePath: 'still-my-data/' })
    configure({ relativePath: 'http://example.com' })
    expect(getSetting('databasePath', 'database/')).toBe('still-my-data/')
    expect(getSetting('relativePath', '')).toBe('http://example.com')
  })
})
