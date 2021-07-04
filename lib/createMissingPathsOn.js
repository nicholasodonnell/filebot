const fs = require('fs')

const { compose, map, prop } = require('ramda')
const VError = require('verror')

const createDir = dir => path => {
  const fullPath = `${dir}/${path}`

  try {
    fs.mkdirSync(fullPath, { recursive: true })
  } catch (e) {
    const error = new VError(e, `Failed to create ${fullPath}`)

    throw error
  }
}

const createPath = dir =>
  compose(
    createDir(dir),
    prop('path'),
  )

module.exports = dir =>
  map(createPath(dir))
