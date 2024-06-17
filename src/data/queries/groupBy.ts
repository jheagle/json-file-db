export const groupBy = (dataSet = [], groupProperty = '') => {
  if (!groupProperty) {
    return dataSet
  }
  return dataSet.reduce(
    (groupedData, data) => {
      const property = data[groupProperty]
      if (!groupedData.hasOwnProperty(property)) {
        groupedData[property] = []
      }
      groupedData[property].push(data)
      return groupedData
    },
    {}
  )
}