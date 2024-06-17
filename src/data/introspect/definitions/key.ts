export const key = ({ type = 'index', references = [], autoGenerate = false } = {}) => {
  switch (type) {
    case 'primary':
      autoGenerate = true
    case 'index':
    case 'unique':
      references = ['self']
      break
    case 'multi':
      if (references.length < 2) {
        throw new Error('Multi key indicated with less than two references')
      }
      break
    case 'foreign':
      if (references.length !== 1) {
        throw new Error('Foreign key must have one reference to an external record')
      }
      break
    default:
      throw new Error('Unrecognized key type; must be index, primary, unique, multi, or foreign')
  }
  return {
    type: type,
    references: references,
    autoGenerate: autoGenerate
  }
}