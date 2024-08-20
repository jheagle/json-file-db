import { field } from './field'

describe('field', () => {
  test('can create a field with default value', () => {
    const generatedField = {
      name: 'quantity',
      type: 'string',
      optional: true,
      autoGenerate: false,
      default: 0
    }
    expect(
      field({
        name: generatedField.name,
        type: generatedField.type,
        optional: generatedField.optional,
        autoGenerate: generatedField.autoGenerate,
        useDefault: true,
        defaultValue: generatedField.default
      })
    ).toEqual(generatedField)
  })
})
