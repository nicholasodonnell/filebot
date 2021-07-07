const fs = require('fs')

const {
  compose,
  either,
  isEmpty,
  isNil,
  not,
  tap,
  uncurryN,
} = require('ramda')
const VError = require('verror')

const isNotNilOrEmpty = compose(not, either(isEmpty, isNil))

const writeFile = uncurryN(2, file =>
  data => fs.writeFileSync(file, data),
)

const ensureExists = snapshot => {
  try {
    if (!fs.existsSync(snapshot)) {
      writeFile(snapshot, '')
    }
  } catch (e) {
    const error = new VError(e, `Failed to ensure snapshot ${snapshot} exists`)

    throw error
  }
}

const readFile = compose(
  file => fs.readFileSync(file, 'utf8'),
  tap(ensureExists),
)

const loadSnapshot = snapshot => {
  try {
    const snapshotData = readFile(snapshot)
    const snapshotItems = isNotNilOrEmpty(snapshotData) ? JSON.parse(snapshotData) : []

    console.log(`Got snapshot ${snapshot} with ${snapshotItems.length} items`)

    return snapshotItems
  } catch (e) {
    const error = new VError(e, `Failed to load snapshot ${snapshot}`)

    throw error
  }
}

const saveSnapshot = (snapshot, snapshotItems) => {
  try {
    const snapshotData = JSON.stringify(snapshotItems, null, 2)

    writeFile(snapshot, snapshotData)

    console.log(`Saved snapshot ${snapshot} with ${snapshotItems.length} items`)
  } catch (e) {
    const error = new VError(e, `Failed to save snapshot ${snapshot}`)

    throw error
  }
}

module.exports = {
  loadSnapshot,
  saveSnapshot,
}
