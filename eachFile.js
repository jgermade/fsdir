
const { promisify } = require('util')
const glob = require('glob')
const minimatch = require('minimatch')

const { reducePromises } = require('./helpers')

const execGlob = promisify(glob)

async function _matchPatterns (patterns, options, matchedFiles = []) {
  const pattern = patterns.shift()

  if (!pattern) return matchedFiles

  if (/^!/.test(pattern)) {
    const excludeFiles = minimatch.filter(pattern)

    return await _matchPatterns(
      patterns,
      options,
      matchedFiles.filter(excludeFiles)
    )
  }

  const _matchedFiles = await execGlob(pattern, options)

  _matchedFiles.forEach(
    (filepath) => {
      if (!matchedFiles.includes(filepath)) matchedFiles.push(filepath)
    }
  )

  return await _matchPatterns(patterns, options, matchedFiles)
}

async function matchFiles (patterns, options = {}) {
  if (typeof patterns === 'string') patterns = patterns.split(/ *; */)
  if (patterns instanceof Array === false) throw new TypeError('pattern should be a String or an Array')

  return await _matchPatterns(patterns, options)
}

async function eachFile (patterns, options = {}, iteratee) {
  if (options instanceof Function) {
    iteratee = options
    options = {}
  }
  
  const matchedFiles = await matchFiles(patterns, options)

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

module.exports = {
  eachFile,
  matchFiles,
}
