import { EventEmitter } from 'events'
import * as readline from 'readline'
import { stripVTControlCharacters } from 'util'

jest.mock('readline')

/**
 * Load a fresh copy of the CLI against a fake readline interface, so each test drives its own session.
 * @returns {EventEmitter} The fake interface, emit 'line' on it to simulate the user pressing Enter.
 */
const startCli = () => {
  const rl = new EventEmitter()
  rl.prompt = jest.fn()
  rl.setPrompt = jest.fn()
  rl.close = jest.fn(() => rl.emit('close'))
  readline.createInterface.mockReturnValue(rl)
  jest.isolateModules(() => require('./index'))
  return rl
}

/**
 * Each query the CLI handed off for processing, in order.
 * @returns {Array<string>}
 */
const receivedQueries = () => console.log.mock.calls
  .map(([message]) => message)
  .filter(message => typeof message === 'string' && message.startsWith('Received:\n'))
  .map(message => message.replace('Received:\n', ''))

/**
 * The prompt most recently set on the interface, without any colour codes.
 * @param {EventEmitter} rl
 * @returns {string}
 */
const lastPrompt = rl => stripVTControlCharacters(rl.setPrompt.mock.lastCall[0])

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {})
  jest.spyOn(process, 'exit').mockImplementation(() => {})
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('the interactive CLI', () => {
  test('a single line ending in a semicolon is processed as one query', () => {
    const rl = startCli()
    rl.emit('line', 'read foo;')
    expect(receivedQueries()).toEqual(['read foo;'])
  })

  test('pressing Enter before the semicolon continues the same query', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    expect(receivedQueries()).toEqual([])
    expect(lastPrompt(rl)).toBe('         -> ')

    rl.emit('line', 'where note = \'hello\';')
    expect(receivedQueries()).toHaveLength(1)
    expect(lastPrompt(rl)).toBe('JSON-Query> ')
  })

  test('the continuation prompt lines up with the main prompt', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    expect(lastPrompt(rl)).toHaveLength('JSON-Query> '.length)
    expect(lastPrompt(rl).endsWith('-> ')).toBe(true)
  })

  test('continued lines are joined with a space instead of a newline', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    rl.emit('line', '  where note = \'hello\'')
    rl.emit('line', '  limit 1;')
    expect(receivedQueries()).toEqual(['read foo where note = \'hello\' limit 1;'])
  })

  test('a blank line at the start of a query is ignored', () => {
    const rl = startCli()
    rl.emit('line', '')
    rl.emit('line', '   ')
    expect(rl.setPrompt).not.toHaveBeenCalled()

    rl.emit('line', 'read foo;')
    expect(receivedQueries()).toEqual(['read foo;'])
  })

  test('a blank line in the middle of a query adds nothing to it', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    rl.emit('line', '')
    rl.emit('line', 'limit 1;')
    expect(receivedQueries()).toEqual(['read foo limit 1;'])
  })

  test('the buffer is reset after each query', () => {
    const rl = startCli()
    rl.emit('line', 'read foo;')
    rl.emit('line', 'read bar;')
    expect(receivedQueries()).toEqual(['read foo;', 'read bar;'])
  })

  test('/exit closes the session in any letter case', () => {
    const rl = startCli()
    rl.emit('line', '/EXIT')
    expect(rl.close).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(0)
    expect(receivedQueries()).toEqual([])
  })
})
