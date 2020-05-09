
const { reducePromises, matchPatterns } = require('./helpers')

module.exports = each

async function each (patterns, options = {}, iteratee) {
  if (options instanceof Function) {
    iteratee = options
    options = {}
  }
  
  const matchedFiles = await matchPatterns(patterns, options)

  if (options.concurrent) {
    return await Promise.all(matchedFiles.map(
      async (filepath) => await iteratee(filepath))
    )
  }

  return await reducePromises(
    matchedFiles.map(
      (filepath) => async () => await iteratee(filepath)
    )
  )
}
