const fs = require('fs')

const { reject } = require('ramda')
const VError = require('verror')

const exists = dir => ({ filename, path }) => {
  const fullPath = `${dir}/${path ? path + '/' : ''}${filename}`

  try {
    return fs.existsSync(fullPath)
  } catch (e) {
    const error = new VError(e, `Failed to check if ${fullPath} exists`)

    throw error
  }
}

module.exports = dir =>
  reject(exists(dir))
