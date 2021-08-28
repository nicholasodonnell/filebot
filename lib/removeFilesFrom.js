const fs = require('fs')

const {
  compose,
  ifElse,
  length,
  lte,
  map,
  prop,
} = require('ramda')
const VError = require('verror')

const removeFileFrom = dir => ({ filename, path }) => {
  const file = `${dir}/${path ? path + '/' : ''}${filename}`
  process.stdout.write(`Removing ${file}... `)

  try {
    fs.unlinkSync(file)

    console.log('Done')
  } catch (e) {
    const error = new VError(e, `Failed to remove ${file}`)

    throw error
  }
}

module.exports = ({ safeDelete }, dir) =>
  ifElse(
    compose(lte(safeDelete), length),
    files => {
      console.log('Too many files will be deleted, skipping', map(prop('location'), files))
    },
    map(removeFileFrom(dir)),
  )
