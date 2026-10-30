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
  rl.line = ''
  rl.write = jest.fn()
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
    expect(lastPrompt(rl)).toBe('         ;> ')

    rl.emit('line', 'where note = \'hello\';')
    expect(receivedQueries()).toHaveLength(1)
    expect(lastPrompt(rl)).toBe('JSON-Query> ')
  })

  test('the continuation prompt lines up with the main prompt', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    expect(lastPrompt(rl)).toHaveLength('JSON-Query> '.length)
    expect(lastPrompt(rl).endsWith(';> ')).toBe(true)
  })

  test('continued lines are joined with a newline', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    rl.emit('line', '  where note = \'hello\'')
    rl.emit('line', '  limit 1;')
    expect(receivedQueries()).toEqual(['read foo\n  where note = \'hello\'\n  limit 1;'])
  })

  test('a blank line at the start of a query is ignored', () => {
    const rl = startCli()
    rl.emit('line', '')
    rl.emit('line', '   ')
    expect(rl.setPrompt).not.toHaveBeenCalled()

    rl.emit('line', 'read foo;')
    expect(receivedQueries()).toEqual(['read foo;'])
  })

  test('a blank line in the middle of a query will be retained', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    rl.emit('line', '')
    rl.emit('line', 'limit 1;')
    expect(receivedQueries()).toEqual(['read foo\n\nlimit 1;'])
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

  test('semi-colon in unclosed string does not close the query', () => {
    const rl = startCli()
    rl.emit('line', 'read foo where note = "hello;')
    rl.emit('line', ' world";')
    expect(receivedQueries()).toEqual(['read foo where note = "hello;\n world";'])
  })

  test('/exit inside unclosed query will just add to query buffer', () => {
    const rl = startCli()
    rl.emit('line', 'read foo')
    rl.emit('line', '/exit')
    rl.emit('line', ';')
    expect(receivedQueries()).toEqual(['read foo\n/exit\n;'])
  })

  test('a comment with -- does not roll to the next line', () => {
    const rl = startCli()
    rl.emit('line', '-- this is a comment;')
    rl.emit('line', 'and this concludes the input;')
    expect(receivedQueries()).toEqual(['-- this is a comment;\nand this concludes the input;'])
  })

  test('a comment after a semi-colon can be complete', () => {
    const rl = startCli()
    rl.emit('line', 'read foo; -- note this is a comment')
    expect(receivedQueries()).toEqual(['read foo; -- note this is a comment'])
  })

  test('prompt will show single quote is still open', () => {
    const rl = startCli()
    rl.emit('line', "read foo from bar where note = '")
    expect(lastPrompt(rl)).toBe("         '> ")
  })

  test('prompt will show double quote is still open', () => {
    const rl = startCli()
    rl.emit('line', 'read foo from bar where note = "')
    expect(lastPrompt(rl)).toBe('         "> ')
  })

  test('prompt will show parentheses is still open', () => {
    const rl = startCli()
    rl.emit('line', 'read foo from bar where status in (')
    expect(lastPrompt(rl)).toBe('         (> ')
  })

  test('prompt will show multi-line comment is still open', () => {
    const rl = startCli()
    rl.emit('line', 'read foo from bar where status in /*')
    expect(lastPrompt(rl)).toBe('        /*> ')
  })

  test('prompt will clear when mid query if Ctrl+C is pressed', () => {
    const rl = startCli()
    rl.emit('line', 'read foo from bar where status in (')
    expect(lastPrompt(rl)).toBe('         (> ')
    rl.emit('SIGINT')
    expect(lastPrompt(rl)).toBe('JSON-Query> ')
  })

  test('Ctrl+C at the start of a query will exit', () => {
    const rl = startCli()
    rl.emit('SIGINT')
    expect(rl.close).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  test('Ctrl+C after will clear a query and then exit on the next Ctrl+C', () => {
    const rl = startCli()
    rl.emit('line', 'read foo from bar where status in (')
    expect(lastPrompt(rl)).toBe('         (> ')
    rl.emit('SIGINT')
    expect(lastPrompt(rl)).toBe('JSON-Query> ')
    rl.emit('SIGINT')
    expect(rl.close).toHaveBeenCalled()
    expect(process.exit).toHaveBeenCalledWith(0)
  })

  test('Ctrl+C with text typed on the first line clears it instead of exiting', () => {
    const rl = startCli()
    rl.line = 'read fo'
    rl.emit('SIGINT')
    expect(rl.write).toHaveBeenCalledWith(null, { ctrl: true, name: 'u' })
    expect(rl.close).not.toHaveBeenCalled()
    expect(process.exit).not.toHaveBeenCalled()
  })
})
