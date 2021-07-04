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

    if (isNotNilOrEmpty(snapshotData)) {
      return JSON.parse(snapshotData)
    }

    return []
  } catch (e) {
    const error = new VError(e, `Failed to load snapshot ${snapshot}`)

    throw error
  }
}

const saveSnapshot = (snapshot, data) => {
  try {
    const snapshotData = JSON.stringify(data, null, 2)

    writeFile(snapshot, snapshotData)

    console.log(`Saved snapshot ${snapshot}`)
  } catch (e) {
    const error = new VError(e, `Failed to save snapshot ${snapshot}`)

    throw error
  }
}

module.exports = {
  loadSnapshot,
  saveSnapshot,
}
