const commander = require('commander')
const { compose, evolve, tap, uncurryN } = require('ramda')
const VError = require('verror')

const createMissingPathsOn = require('./lib/createMissingPathsOn')
const getFilesFrom = require('./lib/getFilesFrom')
const getMissingFilesFrom = require('./lib/getMissingFilesFrom')
const getUnsyncedFilesIn = require('./lib/getUnsyncedFilesIn')
const moveFilesTo = require('./lib/moveFilesTo')
const removeFilesFrom = require('./lib/removeFilesFrom')
const serializeFilesFrom = require('./lib/serializeFilesFrom')
const setPerimissionsFor = require('./lib/setPerimissionsFor')
const { loadSnapshot, saveSnapshot } = require('./lib/snapshot')
const symlinkFilesTo = require('./lib/symlinkFilesTo')

const parseNumber = value => {
  const parsedValue = parseInt(value, 10)

  if (isNaN(parsedValue)) {
    throw new commander.InvalidOptionArgumentError('Not a number.')
  }

  return parsedValue
}

const parseOpts = evolve({
  safeDelete: parseNumber,
  puid: parseNumber,
  pgid: parseNumber,
})

const getFilesAndSerializeFrom = dir =>
  compose(
    serializeFilesFrom(dir),
    getFilesFrom,
  )(dir)

const removeFilesThatDontExistOnFrom = uncurryN(4, (getFrom, removeFrom, opts) =>
  compose(
    removeFilesFrom(removeFrom, opts),
    getMissingFilesFrom(getFrom),
  ),
)

const moveUnsycnedFilesTo = uncurryN(2, dir =>
  compose(
    moveFilesTo(dir),
    tap(createMissingPathsOn(dir)),
    getUnsyncedFilesIn,
  ),
)

const symlinkMissingFilesTo = uncurryN(2, dir =>
  compose(
    symlinkFilesTo(dir),
    tap(createMissingPathsOn(dir)),
    getMissingFilesFrom(dir),
  ),
)

const filebot = opts => {
  const {
    permissions,
    pgid,
    primary,
    puid,
    replica,
    safeDelete = 10,
    snapshot,
  } = opts

  console.log(`------------------------------`)
  console.log(`\n[Starting filebot - ${new Date().toLocaleString()}]:`)
  console.log(`Opts: ${JSON.stringify(opts)}`)

  try {
    // grab previous snapshot
    console.log('\n[Loading previous snapshot]:')
    const replicaSnapshotFiles = loadSnapshot(snapshot)

    // remove any files that were deleted on the replica directory from the primary directory
    console.log('\n[Removing deleted files]:')
    removeFilesThatDontExistOnFrom(replica, primary, { safeDelete }, replicaSnapshotFiles)

    // move any non-symlinked files that exist on the replica directory to the primary directory
    console.log('\n[Moving unsynced files]:')
    const replicaFiles = getFilesAndSerializeFrom(replica)
    moveUnsycnedFilesTo(primary, replicaFiles)

    // symlink any files that exist on the primary directory to the replica directory
    console.log('\n[Symlinking missing files]:')
    const primaryFiles = getFilesAndSerializeFrom(primary)
    symlinkMissingFilesTo(replica, primaryFiles)

    // remove any files that were deleted on the primary directory from the replica directory.
    console.log('\n[Removing files that no longer exist]:')
    removeFilesThatDontExistOnFrom(primary, replica, { safeDelete }, replicaFiles)

    // save latest snapshot
    console.log('\n[Saving latest snapshot]:')
    saveSnapshot(snapshot, getFilesAndSerializeFrom(replica))

    // set replica permissions
    console.log('\n[Setting permissions]:')
    setPerimissionsFor(replica, { permissions, pgid, puid })

    console.log(`\n[Filebot complete - ${new Date().toLocaleString()}]`)
  } catch (e) {
    const error = new VError(e, `Filebot failed`)

    console.log(`\n[Filebot failed - ${new Date().toLocaleString()}]:`)
    console.error(VError.fullStack(error))

    throw error
  } finally {
    console.log(`\n------------------------------\n\n`)
  }
}

if (require.main === module) {
  const opts = commander.program
    .requiredOption('--primary <path>', 'Primary path')
    .requiredOption('--replica <path>', 'Replica path')
    .requiredOption('--snapshot <path>', 'Snapshot path')
    .option('--safeDelete <number>', 'Number of items to safely delete')
    .option('--permissions <string>', 'Replica permissions')
    .option('--puid <string>', 'Replica owner user')
    .option('--pgid <string>', 'Replica owner group')
    .parse(process.argv)
    .opts()

  try {
    filebot(parseOpts(opts))

    process.exit(0)
  } catch (e) {
    process.exit(1)
  }
}

module.exports = filebot
