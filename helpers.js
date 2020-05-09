
const path = require('path')
const { promisify } = require('util')
const { exec } = require('child_process')

const glob = require('glob')
const minimatch = require('minimatch')

async function _reducePromises (promisesList, result) {
  const next = promisesList.shift()

  if (!next) return result

  return _reducePromises(
    promisesList,
    await next.run(result)
  )
}

function _round (num, decimals) {
  var _pow = Math.pow(10, decimals)
  return Math.round(num * _pow) / _pow
}

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

async function matchPatterns (patterns, options = {}) {
  if (typeof patterns === 'string') patterns = patterns.split(/ *; */)
  if (patterns instanceof Array === false) throw new TypeError('pattern should be a String or an Array')

  return await _matchPatterns(patterns, options)
}

module.exports = {

  matchPatterns,

  async reducePromises (promisesList) {
    return await _reducePromises(
      promisesList.map((run) => run instanceof Function ? { run } : run)
    )
  },

  matchFilters (filters) {
    const _filters = filters.map(
      (pattern) => {
        return pattern[0] === '!'
          ? {
            exclusion: true,
            matches: minimatch.filter(pattern.substr(1)),
          }
          : { matches: minimatch.filter(pattern) }
      }
    )

    return (filepath) => {
      var matched = false
      
      _filters.forEach(
        (_) => {
          if (_.exclusion) {
            if (matched && _.matches(filepath)) matched = false
          } else if (!matched && _.matches(filepath)) {
            matched = true
          }
        }
      )
      
      return matched
    }
  },

  reducePatterns (patternList) {
    const patterns = []
    var current = null

    patternList.forEach((param, i) => {
      if (i % 2) {
        current.command = param
        patterns.push(current)
      } else {
        current = {
          pattern: param.trim(),
        }
      }
    })

    return patterns
  },

  getFileENV (filepath, options = {}) {
    const { cwd = null } = options

    const parsed = path.parse(filepath)

    return {
      FILE_BASE: parsed.base,
      FILE_NAME: parsed.name,
      FILE_EXT: parsed.ext,
      FILE_PATH: path.relative(
        process.cwd(),
        cwd ? path.resolve(cwd, filepath) : filepath
      ),
      FILE_DIR: parsed.dir,
      FILE_CWD: cwd || '.',
      FILE_CWDPATH: path.relative(
        process.cwd(),
        cwd ? path.resolve(cwd, filepath) : filepath
      ),
      FILE_CWDDIR: path.relative(
        process.cwd(),
        cwd ? path.resolve(cwd, parsed.dir) : parsed.dir
      ) || '.',
      FILE_ROOTPATH: cwd
        ? path.resolve(process.cwd(), cwd, filepath)
        : path.resolve(process.cwd(), filepath)
      ,
    }
  },

  runCommand (command, options = {}) {
    return new Promise(function (resolve, reject) {
      const cp = exec(command, {
        env: options.env
          ? Object.assign(
            Object.create(process.env),
            options.env
          )
          : (options.orphan_env || process.env),
      }, (err, stdout, stderr) => {
        if (err) reject(err)
        resolve()
      })
      if (options.stdout) cp.stdout.pipe(process.stdout)
      if (options.stderr || options.stdout) cp.stderr.pipe(process.stderr)
    })
  },

  getmSeconds (time) {
    if (time > 1000) return _round(time / 1000, 2) + 's'
    return _round(time, 2) + 'ms'
  },

}
