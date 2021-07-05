const { execSync } = require('child_process')

const VError = require('verror')

module.exports = (dir, { permissions, pgid, puid }) => {
  try {
    if (permissions) {
      execSync(`chmod -R ${permissions} ${dir}`)
    }

    if (pgid && puid) {
      execSync(`chown -R ${pgid}:${puid} ${dir}`)
    }

    console.log(`Set permissions for ${dir}`)
  } catch (e) {
    const error = new VError(e, `Failed to set permissions for ${dir}`)

    throw error
  }
}
