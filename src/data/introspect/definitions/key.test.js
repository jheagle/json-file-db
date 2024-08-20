import { key } from './key'

describe('key', () => {
  test('can generate a primary key', () => {
    const primaryKey = {
      type: 'primary',
      fields: [
        '_id'
      ],
      lookup: 'pk__id.json'
    }
    expect(key(primaryKey)).toEqual(primaryKey)
  })

  test('can generate an index key', () => {
    const indexKey = {
      type: 'index',
      fields: [
        'date'
      ],
      lookup: 'index_date.json'
    }
    expect(key(indexKey)).toEqual(indexKey)
  })

  test('can generate an unique key', () => {
    const uniqueKey = {
      type: 'unique',
      fields: [
        'email'
      ],
      lookup: 'unique_email.json'
    }
    expect(key(uniqueKey)).toEqual(uniqueKey)
  })

  test('can generate a multi key', () => {
    const multiKey = {
      type: 'multi',
      fields: [
        'email',
        'user_id'
      ],
      lookup: 'multi_email_user_id.json'
    }
    expect(key(multiKey)).toEqual(multiKey)
  })

  test('can generate a foreign key', () => {
    const foreignKey = {
      type: 'foreign',
      fields: [
        'user_id'
      ],
      lookup: 'fk_user_id.json',
      references: [
        {
          fields: [
            'users._id'
          ],
          lookup: 'users.json'
        }
      ]
    }
    expect(key(foreignKey)).toEqual(foreignKey)
  })

  test('will throw Error for invalid multi, insufficient fields', () => {
    const multiKey = {
      type: 'multi',
      fields: [
        'email'
      ],
      lookup: 'multi_email_user_id.json'
    }
    expect(() => key(multiKey)).toThrow(Error)
  })

  test('will throw Error for invalid foreign, insufficient references', () => {
    const foreignKey = {
      type: 'foreign',
      fields: [
        'user_id'
      ],
      lookup: 'fk_user_id.json'
    }
    expect(() => key(foreignKey)).toThrow(Error)
  })

  test('will throw Error for unknown key type', () => {
    const strangeKey = {
      type: 'strange',
      fields: [
        'blah'
      ],
      lookup: 'strange_blah.json'
    }
    expect(() => key(strangeKey)).toThrow(Error)
  })
})
