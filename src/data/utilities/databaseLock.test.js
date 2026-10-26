import { withDatabaseLock } from './databaseLock'
import { configure } from './config'
import { create, drop, query } from '../../index'
import { setUp } from 'test-filesystem'

const { readFile } = require('fs/promises')

const databasePath = 'database-lock-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

beforeEach(setUp.beforeEach)

afterEach(() => {
  configure({ databasePath })
  return setUp.afterEach()
})

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('withDatabaseLock', () => {
  test('runs tasks on one database one at a time, in the order they were started', async () => {
    const events = []
    const task = (name, ms) => withDatabaseLock(async () => {
      events.push(`${name} start`)
      await wait(ms)
      events.push(`${name} end`)
      return name
    })
    expect(await Promise.all([task('a', 20), task('b', 0), task('c', 5)])).toEqual(['a', 'b', 'c'])
    expect(events).toEqual(['a start', 'a end', 'b start', 'b end', 'c start', 'c end'])
  })

  test('a task that throws still lets the next one run', async () => {
    const failing = withDatabaseLock(async () => { throw new Error('boom') })
    const next = withDatabaseLock(async () => 'ran')
    await expect(failing).rejects.toThrow('boom')
    await expect(next).resolves.toBe('ran')
  })

  test('tasks on different databases do not wait for each other', async () => {
    const events = []
    configure({ databasePath: 'one/' })
    const slow = withDatabaseLock(async () => { await wait(20); events.push('one') })
    configure({ databasePath: 'two/' })
    const fast = withDatabaseLock(async () => { events.push('two') })
    await Promise.all([slow, fast])
    expect(events).toEqual(['two', 'one'])
  })
})

describe('concurrent calls through the public API', () => {
  const schema = 'create t (_id string auto, code string optional, primary key (_id), unique (code))'

  test('ten parallel inserts all land: every row readable and indexed', async () => {
    await query(schema)
    await Promise.all(Array.from({ length: 10 }, (_, i) => query(`insert t values code = 'c${i}'`)))
    const [rows] = await query('read t')
    expect(rows.map(row => row.code).sort()).toEqual(Array.from({ length: 10 }, (_, i) => `c${i}`).sort())
    const record = JSON.parse(await readFile(`${databasePath}t.json`, 'utf8'))
    expect(record.entries).toHaveLength(10)
    const index = JSON.parse(await readFile(`${databasePath}__indexes/t/unique_code.json`, 'utf8'))
    expect(index).toHaveLength(10)
  })

  test('two parallel inserts of one unique value: exactly one is rejected', async () => {
    await query(schema)
    const results = await Promise.allSettled([query("insert t values code = 'same'"), query("insert t values code = 'same'")])
    expect(results.map(result => result.status).sort()).toEqual(['fulfilled', 'rejected'])
    const [rows] = await query('read t')
    expect(rows).toHaveLength(1)
  })

  test('parallel updates of one row both apply, neither overwrites the other\'s field', async () => {
    await query('create u (_id string auto, a string optional, b string optional, primary key (_id))')
    const [[row]] = await query("insert u values a = 'old', b = 'old'")
    await Promise.all([query(`update u set a = 'A' where _id = '${row._id}'`), query(`update u set b = 'B' where _id = '${row._id}'`)])
    const [[updated]] = await query('read u')
    expect(updated).toMatchObject({ a: 'A', b: 'B' })
  })

  test('the queries of one call run together, with no other call between them', async () => {
    await query(schema)
    const [reads] = await Promise.all([
      query("insert t values code = 'x'; read t"),
      query("insert t values code = 'y'")
    ])
    expect(reads[1].map(row => row.code)).toEqual(['x'])
  })

  test('create(), drop() and query() share the lock', async () => {
    const results = await Promise.allSettled([
      create('r', [{ name: 'a', type: 'string' }], []),
      query('create r (a string)'),
      drop('r'),
      query('show records')
    ])
    expect(results.map(result => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled', 'fulfilled'])
    expect(results[1].reason.message).toBe('Record "r" already exists')
    expect(results[3].value).toEqual([[]])
  })
})
