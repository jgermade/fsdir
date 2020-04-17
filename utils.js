

function _round(num, decimals) {
  var _pow = Math.pow(10, decimals)
  return Math.round(num * _pow) / _pow
}

module.exports = {
  getmSeconds (time) {
    if( time > 1000 ) return _round(time/1000, 2) + 's'
    return _round(time, 2) + 'ms'
  },

  async runPromises (promises, options = {}) {
    const next = promises.next()
  
    if (!next) return
  
    var _start = performance.now()
  
    if (options.onStart) options.onStart.call(next)
    await (next.cmd || next).call(next)
    if (options.onEnd) options.onEnd.call(next, getmSeconds(performance.now() - _start) )
  
    await runPromises(promises)
  },
}
