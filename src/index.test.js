import { query, quote, queryStatus, create, drop, describe as describeRecord, configure } from './index'
import { setUp } from 'test-filesystem'

const databasePath = 'public-api-database/'
configure({ databasePath })
setUp.setDefaults(databasePath)

beforeEach(setUp.beforeEach)

afterEach(setUp.afterEach)

describe('the public package entry point', () => {
  test('create, insert, read, update, delete, and drop all work through the exported functions', async () => {
    const definition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'note', type: 'string', optional: true, autoGenerate: false }
    ]
    const keys = [
      { type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }
    ]

    await create('foo', definition, keys)

    const inserted = await query("insert foo values note = 'hello'")
    expect(inserted[0]).toHaveLength(1)

    const read = await query('read foo')
    expect(read[0]).toHaveLength(1)
    expect(read[0][0].note).toBe('hello')

    const updated = await query("update foo set note = 'updated' where note = 'hello'")
    expect(updated[0][0].note).toBe('updated')

    const deleted = await query("delete foo where note = 'updated'")
    expect(deleted[0]).toHaveLength(1)

    const afterDelete = await query('read foo')
    expect(afterDelete[0]).toEqual([])

    await drop('foo')
  })

  test('describe reports a record\'s field definition', async () => {
    const definition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true }
    ]
    await create('bar', definition, [])
    const result = await describeRecord('bar')
    expect(result).toEqual(definition)
  })

  test('quote stores any text exactly, and finds it again', async () => {
    const definition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'note', type: 'string', optional: true, autoGenerate: false }
    ]
    await create('foo', definition, [{ type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }])
    const note = 'Farmer\'s walk; read foo -- "heavy" \\ not a comment'

    await query(`insert foo values note = ${quote(note)}`)
    const [found] = await query(`read foo where note = ${quote(note)}`)
    expect(found.map(({ note }) => note)).toEqual([note])

    await drop('foo')
  })

  test('queryStatus is exported, for prompts which read a query over several lines', () => {
    expect(queryStatus("read foo where note = 'a;")).toEqual({ complete: false, waitingFor: "'" })
    expect(queryStatus("read foo where note = 'a;';")).toEqual({ complete: true, waitingFor: '' })
  })

  test('command words and sort directions work in any case, and give the rows lowercase ones do', async () => {
    const definition = [
      { name: '_id', type: 'string', optional: false, autoGenerate: true },
      { name: 'name', type: 'string', optional: false, autoGenerate: false },
      { name: 'n', type: 'number', optional: true, nullable: true, autoGenerate: false }
    ]
    await create('Cased', definition, [{ type: 'primary', fields: ['_id'], lookup: 'pk__id.json' }])
    await query("insert Cased values name = 'five', n = 5")
    await query("insert Cased values name = 'null', n = null")
    await query("insert Cased values name = 'zero', n = 0")
    await query("insert Cased values name = 'missing'")
    await query("insert Cased values name = 'twelve', n = 12")

    const names = async (text) => (await query(text))[0].map(row => row.name)
    const ascending = await names('read Cased sort n asc')
    const descending = await names('read Cased sort n desc')
    expect(ascending).toEqual(['missing', 'null', 'zero', 'five', 'twelve'])
    expect(descending).toEqual(['twelve', 'five', 'zero', 'null', 'missing'])
    for (const word of ['READ', 'Read']) {
      for (const direction of ['ASC', 'Asc']) {
        expect(await names(`${word} Cased sort n ${direction}`)).toEqual(ascending)
      }
      for (const direction of ['DESC', 'Desc']) {
        expect(await names(`${word} Cased sort n ${direction}`)).toEqual(descending)
      }
    }

    await query("INSERT Cased values name = 'new', n = 1")
    await query("Insert Cased values name = 'newer', n = 2")
    expect(await names('read Cased where n = 1 or n = 2 sort n')).toEqual(['new', 'newer'])
    expect((await query("UPDATE Cased set n = 7 where name = 'new'"))[0][0].n).toBe(7)
    expect((await query("Update Cased set n = 8 where name = 'newer'"))[0][0].n).toBe(8)
    expect(await names('read Cased where n >= 7 sort n')).toEqual(['new', 'newer', 'twelve'])
    expect(await query("DELETE Cased where name = 'new'")).toHaveLength(1)
    expect((await query("Delete Cased where name = 'newer'"))[0]).toHaveLength(1)
    expect(await names('read Cased where n >= 7')).toEqual(['twelve'])

    await expect(query('read cased')).rejects.toThrow()
  })
})
