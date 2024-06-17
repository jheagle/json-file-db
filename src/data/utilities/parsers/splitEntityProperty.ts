const entityMatch = /^[a-z0-9_-]+/i
const propertyMatch = /\.([a-z0-9_-]+)$/i

export const splitEntityProperty = entityProp => {
  const entityFound = entityProp.match(entityMatch)
  if (!entityFound) {
    throw new Error(`Unable to use property: ${entityProp}`)
  }
  const propFound = entityProp.match(propertyMatch)
  if (!propFound) {
    throw new Error(`Unable to use property: ${entityProp}`)
  }
  return {
    entity: entityFound[0],
    property: propFound[1]
  }
}