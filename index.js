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

const getDateTime = () => {
  const now = new Date()

  return now.getDate() + '/' +
    (now.getMonth() + 1)  + '/' +
    now.getFullYear() + ' ' +
    now.getHours() + ':' +
    now.getMinutes() + ':' +
    now.getSeconds()
}

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
    destination,
    permissions = '777',
    pgid,
    puid,
    safeDelete = 10,
    snapshot,
    source,
  } = opts

  console.log(`------------------------------`)
  console.log(`\n[Starting filebot]:`)
  console.log(`Opts: ${JSON.stringify(opts)}`)
  console.log(`Date: ${getDateTime()}`)

  try {
    console.log('\n[Loading previous snapshot]:')
    const snapshotFiles = loadSnapshot(snapshot)

    // remove any files that were deleted on the source directory (since the previous run) from the destination directory
    console.log('\n[Removing files that were deleted]:')
    removeFilesThatDontExistOnFrom(source, destination, { safeDelete }, snapshotFiles)

    // move any non-symlinked files that exist on the source directory to the destination directory
    console.log('\n[Moving unsynced files]:')
    const sourceFiles = getFilesAndSerializeFrom(source)
    moveUnsycnedFilesTo(destination, sourceFiles)

    // symlink any files that exist on the destination directory to the source directory
    console.log('\n[Symlinking missing files]:')
    const destinationFiles = getFilesAndSerializeFrom(destination)
    symlinkMissingFilesTo(source, destinationFiles)

    // remove any files that exist on the source directory but not the destination directory
    console.log('\n[Removing files from source that don\'t exist on destination]:')
    removeFilesThatDontExistOnFrom(destination, source, { safeDelete }, sourceFiles)

    console.log('\n[Saving latest snapshot]:')
    saveSnapshot(snapshot, getFilesAndSerializeFrom(source))

    console.log('\n[Setting permissions]:')
    setPerimissionsFor(source, { permissions, pgid, puid })

    console.log('\n[Filebot complete]')
  } catch (e) {
    const error = new VError(e, `Filebot failed`)

    console.log('\n[Filebot failed]:')
    console.error(VError.fullStack(error))

    throw error
  } finally {
    console.log(`\n------------------------------\n\n`)
  }
}

if (require.main === module) {
  const opts = commander.program
    .requiredOption('--source <path>', 'Source path')
    .requiredOption('--destination <path>', 'Destination path')
    .requiredOption('--snapshot <path>', 'Snapshot path')
    .option('--safeDelete <number>', 'Safe delete', 10)
    .option('--permissions <string>', 'Source permissions')
    .option('--puid <string>', 'Source owner user')
    .option('--pgid <string>', 'Source owner group')
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
