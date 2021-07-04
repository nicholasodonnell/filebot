const { propEq, reject } = require('ramda')

module.exports =
  reject(propEq('isSymbolicLink', true))
