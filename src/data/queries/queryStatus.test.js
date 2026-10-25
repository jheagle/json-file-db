import { queryStatus } from './queryStatus'

// Lines joined the way a prompt should join them
const typed = (...lines) => queryStatus(lines.join('\n'))

describe('queryStatus', () => {
  test('is complete once the query ends with a ;', () => {
    expect(queryStatus('read notes;')).toEqual({ complete: true, waitingFor: '' })
    expect(typed('read notes', 'where id = 1;')).toEqual({ complete: true, waitingFor: '' })
  })

  test('is complete with only whitespace or comments after the ;', () => {
    expect(typed('read notes; ', '-- done', '/* really */ ')).toEqual({ complete: true, waitingFor: '' })
  })

  test('waits for a ; when everything is closed but the query isn\'t ended', () => {
    expect(queryStatus('read notes')).toEqual({ complete: false, waitingFor: ';' })
    expect(queryStatus('read a; read b')).toEqual({ complete: false, waitingFor: ';' })
    expect(queryStatus('')).toEqual({ complete: false, waitingFor: ';' })
  })

  test('waits for the quote of an open string, where a ; is just text', () => {
    expect(typed('insert notes values text = \'it\\\'s;')).toEqual({ complete: false, waitingFor: '\'' })
    // An unescaped quote closes the string, so this one is a finished query
    expect(typed('insert notes values text = \'it\'s;')).toEqual({ complete: true, waitingFor: '' })
    expect(typed('insert notes values text = "first line;', 'second;')).toEqual({ complete: false, waitingFor: '"' })
    expect(typed('insert notes values text = \'ends with a backslash \\\';')).toEqual({ complete: false, waitingFor: '\'' })
  })

  test('waits for the end of a block comment, where a ; is just text', () => {
    expect(typed('read notes /* why;', 'still why;')).toEqual({ complete: false, waitingFor: '/*' })
  })

  test('waits for the innermost open bracket, where a ; is just text', () => {
    expect(typed('read notes where id in [1, (2;')).toEqual({ complete: false, waitingFor: '(' })
    expect(typed('read notes where id in [1, 2;')).toEqual({ complete: false, waitingFor: '[' })
  })

  test('ends a -- comment at the end of the line, so the next line still counts', () => {
    expect(typed('read notes -- the ; here is a comment', 'where id = 1')).toEqual({ complete: false, waitingFor: ';' })
    expect(typed('read notes -- comment', 'where id = 1;')).toEqual({ complete: true, waitingFor: '' })
  })

  test('is complete for a stray closing bracket, so the parser reports it when the query runs', () => {
    expect(queryStatus('read notes where id in 1];')).toEqual({ complete: true, waitingFor: '' })
  })
})
