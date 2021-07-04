const fs = require('fs')

const { map } = require('ramda')
const VError = require('verror')

const symlinkTo = dir => ({ filename, path, location }) => {
  const symlink =  `${dir}/${path ? path + '/' : ''}${filename}`
  process.stdout.write(`Symlinking ${location} -> ${symlink}... `)

  try {
    fs.symlinkSync(location, symlink)

    console.log('Done')
  } catch (e) {
    const error = new VError(e, `Failed to symlink ${location} -> ${symlink}`)

    throw error
  }
}

module.exports = dir =>
  map(symlinkTo(dir))
