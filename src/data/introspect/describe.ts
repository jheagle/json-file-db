import { retrieveFile } from '../utilities/retrieveFile'

export const describe = async (record = '__RECORDS') => {
  const recordFile = await retrieveFile(`${record}.json`)
  if (record === '__RECORDS') {
    return recordFile.entries
  }
  return recordFile.description
}