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
const { loadSnapshot, saveSnapshot } = require('./lib/snapshot')
const symlinkFilesTo = require('./lib/symlinkFilesTo')

const parseNumber = value => {
  const parsedValue = parseInt(value, 10)

  if (isNaN(parsedValue)) {
    throw new commander.InvalidOptionArgumentError('Not a number.')
  }

  return parsedValue
}

const parseProps = evolve({
  safeDelete: parseNumber,
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

const filebot = async ({ source, destination, safeDelete = 10, snapshot }) => {
  try {
    const snapshotFiles = loadSnapshot(snapshot)
    const sourceFiles = getFilesAndSerializeFrom(source)

    // remove any files that were deleted on the source directory (since the previous run) from the destination directory
    console.log('Removing files that were deleted:\n')
    removeFilesThatDontExistOnFrom(source, destination, { safeDelete }, snapshotFiles)

    // move any non-symlinked files that exist on the source directory to the destination directory
    console.log('\n\nMoving unsynced files:\n')
    moveUnsycnedFilesTo(destination, sourceFiles)

    const destinationFiles = getFilesAndSerializeFrom(destination)

    // symlink any files that exist on the destination directory to the source directory
    console.log('\n\nSymlinking missing files:\n')
    symlinkMissingFilesTo(source, destinationFiles)

    // remove any files that exist on the source directory but not the destination directory
    console.log('\n\nRemoving files from source that don\'t exist on destination:\n')
    removeFilesThatDontExistOnFrom(destination, source, { safeDelete }, sourceFiles)

    console.log('\n\nSaving latest snapshot:')
    saveSnapshot(snapshot, getFilesAndSerializeFrom(source))
  } catch (e) {
    throw new VError(e, `Filebot failed`)
  }
}

if (require.main === module) {
  const props = commander.program
    .requiredOption('--source <path>', 'Source path')
    .requiredOption('--destination <path>', 'Destination path')
    .requiredOption('--snapshot <path>', 'Snapshot path')
    .option('--safeDelete <number>', 'Safe delete', 10)
    .parse(process.argv)
    .opts()

  console.log(`Starting app with props:\n${JSON.stringify(props)}\n\n`)

  filebot(...parseProps(props))
    .then(() => console.log('\n\nFilebot complete'))
    .then(() => process.exit(0))
    .catch(e => {
      console.error(VError.fullStack(e))

      process.exit(1)
    })
}

module.exports = filebot
