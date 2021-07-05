const fs = require('fs')

const VError = require('verror')

module.exports = (dir, { permissions, pgid, puid }) => {
  try {
    if (permissions) {
      fs.chmodSync(dir, permissions)
    }

    if (pgid && puid) {
      fs.chownSync(dir, puid, pgid)
    }

    console.log(`Set permissions for ${dir}`)
  } catch (e) {
    const error = new VError(e, `Failed to set permissions for ${dir}`)

    throw error
  }

}
