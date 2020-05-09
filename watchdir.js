
const chokidar = require('chokidar')

const { matchFilters } = require('./helpers')
const Watcher = require('./watcher')

class WatchDir extends Watcher {
  constructor (cwd = '.', options = {}) {
    if (typeof cwd === 'object') {
      options = cwd
      cwd = options.dir || '.'
    }
    super(options)
    this.cwd = cwd
    this.options = options

    if (!options.manual_boot) this.watch(cwd)
  }

  when (pattern, cbFn) {
    var matches = matchFilters(pattern.split(';').map((patt) => patt.trim()))

    this.when_queue.push({
      pattern,
      when: (filesChanged) => filesChanged.some((filepath) => matches(filepath)),
      cbFn,
    })
  }

  watch (cwd) {
    const _self = this
    const { debounceWatch } = _self.options
    const filesChanged = []
    cwd = cwd || _self.cwd

    function _processFiles () {
      if (!filesChanged.length) return

      _self.process(
        debounceWatch
          ? filesChanged.splice(0)
          : [filesChanged.shift()]
      )
        .then(_processFiles)
        .catch(console.error) // eslint-disable-line no-console
    }

    chokidar
      .watch('.', {
        cwd,
        ignoreInitial: true,
      })
      .on('all', (_event, path) => {
        if (!filesChanged.includes(path)) filesChanged.push(path)

        _processFiles()
      })
  }
}

module.exports = WatchDir
