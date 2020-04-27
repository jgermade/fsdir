
const glob = require('glob')
const minimatch = require('minimatch')

const { promisify } = require('util')

const { reducePromises } = require('./helpers')

const execGlob = promisify(glob)

async function _matchPatterns (patterns, options, matched_files = []) {
  const pattern = patterns.shift()

  if (!pattern) return matched_files

  if (/^!/.test(pattern)) {
    let excludeFiles = minimatch.filter(pattern)
    return await _matchPatterns(patterns, options, matched_files.filter(excludeFiles) )
  }

  let _matched_files = await execGlob(pattern, options)

  _matched_files.forEach( (filepath) => {
    if (!matched_files.includes(filepath)) matched_files.push(filepath)
  })

  return await _matchPatterns(patterns, options, matched_files)
}

async function matchPatterns(patterns, options = {}) {
  if (typeof patterns === 'string') patterns = patterns.split(/ *; */)
  if (patterns instanceof Array === false) throw new TypeError('pattern should be a String or an Array')


  return await _matchPatterns(patterns, options)
}

module.exports = {
  matchPatterns,

  async each(patterns, options = {}, iteratee) {
    if (options instanceof Function) {
      iteratee = options
      options = {}
    }
    
    let matched_files = await matchPatterns(patterns, options)

    if (options.concurrent) {
      return await Promise.all(matched_files.map( async (filepath) => await iteratee(filepath) ))
    }

    return await reducePromises( matched_files.map( (filepath) => async () => await iteratee(filepath) ) )
  },
}
