
const { exec } = require('child_process')
const path = require('path')

async function _reducePromises(promises_list, result) {
  const next = promises_list.shift()

  if (!next) return result

  return _reducePromises(promises_list,
    await next.run.call(next, result)
  )
}

module.exports = {

  async reducePromises(promises_list) {
    return await _reducePromises(
      promises_list.map((run) => run instanceof Function ? { run } : run)
    )
  },

  reducePatterns(pattern_list) {
    const patterns = []
    var current = null

    pattern_list.forEach((param, i) => {
      if (i % 2) {
        current.command = param
        patterns.push(current)
      } else current = {
        pattern: param.trim(),
      }
    })

    return patterns
  },

  getFileENV(filepath, options = {}) {
    const { cwd = null } = options

    const parsed = path.parse(filepath)

    return {
      FILE_DIR: parsed.dir,
      FILE_BASE: parsed.base,
      FILE_NAME: parsed.name,
      FILE_EXT: parsed.ext,
      FILE_CWDDIR: path.relative(process.cwd(), cwd ? path.resolve(cwd, parsed.dir) : parsed.dir) || '.',
      FILE_FULLPATH: cwd
        ? path.resolve(cwd, filepath)
        : path.resolve(process.cwd(), cwd, filepath)
      ,
    }
  },

  runCommand(command, options = {}) {
    return new Promise(function (resolve, reject) {
      let cp = exec(command, options, (err) => err ? reject(err) : resolve())

      if (options.stdout) cp.stdout.pipe(process.stdout)
      if (options.stderr || options.stdout) cp.stderr.pipe(process.stderr)
    })
  },

}
