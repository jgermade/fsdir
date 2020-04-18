
const { exec } = require('child_process')

function _round(num, decimals) {
  var _pow = Math.pow(10, decimals)
  return Math.round(num * _pow) / _pow
}

async function runPromises (promises) {
  const next = promises.shift()

  if (!next) return

  await next.call(next)
  await runPromises(promises)
}

module.exports = {
  getmSeconds (time) {
    if( time > 1000 ) return _round(time/1000, 2) + 's'
    return _round(time, 2) + 'ms'
  },
  runPromises,
  runCommand (command) {
    return new Promise(function (resolve, reject) {
      let cp = exec(command, (err) => err ? reject(err) : resolve() )
      cp.stdout.pipe(process.stdout)
      cp.stderr.pipe(process.stderr)
    })
  }
}
