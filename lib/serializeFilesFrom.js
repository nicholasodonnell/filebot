const path = require('path')

const {
  compose,
  identity,
  isEmpty,
  join,
  juxt,
  last,
  map,
  mergeAll,
  objOf,
  reject,
  replace,
  slice,
  split,
} = require('ramda')

const pathResolve = ({ dir, dirent }) => path.resolve(dir, dirent.name)

const splitPath = compose(reject(isEmpty), split('/'))

const getFilename = compose(objOf('filename'), last)

const getPath = compose(
  objOf('path'),
  join('/'),
  slice(0, -1),
)

const getIsSymbolicLink = compose(
  objOf('isSymbolicLink'),
  ({ dirent }) => dirent.isSymbolicLink(),
)

const getLocation = compose(objOf('location'), identity)

const getPathAndFilename = dir =>
  compose(
    mergeAll,
    juxt([
      getFilename,
      getPath,
    ]),
    splitPath,
    replace(dir, ''),
  )

const getFilenameLocationAndPath = dir =>
  compose(
    mergeAll,
    juxt([
      getLocation,
      getPathAndFilename(dir),
    ]),
    pathResolve,
  )

const serializeFrom = dir =>
  compose(
    mergeAll,
    juxt([
      getIsSymbolicLink,
      getFilenameLocationAndPath(dir),
    ]),
  )

module.exports = dir =>
  map(serializeFrom(dir))
