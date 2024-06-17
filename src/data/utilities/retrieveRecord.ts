import { retrieveFile } from './retrieveFile'

export const retrieveRecord = async (entity = '') => await retrieveFile(`${entity}.json`)