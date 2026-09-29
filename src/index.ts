import { query } from './data/queries/query'
import { create, drop, describe } from './data/introspect'
import { configure } from './data/utilities/config'

export { query, create, drop, describe, configure }
export {
  fieldProperties,
  fieldDefinition,
  fieldName,
  keyProperties,
  keyDefinition,
  indexType,
  indexLocation,
  referenceProperties,
  reference,
  recordProperties,
  recordDefinition,
  recordPath,
  entityPath
} from './data/introspect'

// Loaded via a bare <script> tag (the browser bundle, standalone isn't wired up on the bundler
// side), rather than require()/import - expose the same public API as a global, matching the
// convention used by this project's sibling packages (e.g. pseudo-dom).
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.jsonFsQuery = { query, create, drop, describe, configure }
}
