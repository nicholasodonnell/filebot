const fs = require('fs')

const { map } = require('ramda')
const VError = require('verror')

const syncFileTo = dir => ({ filename, path, location }) => {
  const file =  `${dir}/${path ? path + '/' : ''}${filename}`
  process.stdout.write(`Syncing ${location} -> ${file}... `)

  try {
    // copy
    fs.copyFileSync(location, file)

    // remove
    fs.unlinkSync(location)

    // symlink
    fs.symlinkSync(file, location)

    console.log('Done')
  } catch (e) {
    const error = new VError(e, `Failed to move ${location} -> ${file}`)

    throw error
  }
}

module.exports = dir =>
  map(syncFileTo(dir))
