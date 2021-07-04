const fs = require('fs')
const path = require('path')

const { curry, flatten } = require('ramda')
const VError = require('verror')

const getFiles = curry((dir, dirent) => {
  if (dirent.isDirectory()) {
    return getFilesFrom(path.resolve(dir, dirent.name))
  }

  return { dir, dirent }
})

const getFilesFrom = dir => {
  let files = []

  try {
    const dirents = fs.readdirSync(dir, { withFileTypes: true })

    for (let dirent of dirents) {
      files.push(getFiles(dir, dirent))
    }
  } catch (e) {
    const error = new VError(e, `Failed to get files from ${dir}`)

    throw error
  }

  return flatten(files)
}

module.exports = getFilesFrom
