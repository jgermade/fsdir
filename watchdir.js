
const chokidar = require('chokidar')
const { matcher } = require('micromatch')

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
    var matches = matcher( pattern.split(';').map( (patt) => patt.trim() ) )
    this.when_queue.push({
      pattern,
      when: (files_changed) => files_changed.some( (file) => matches(file) ),
      cbFn,
    })
  }

  watch (cwd) {
    cwd = cwd || this.cwd
    const { files_changed } = this

    chokidar
      .watch('.', {
        cwd: cwd,
        ignoreInitial: true,
      })
      .on('all', (_event, path) => {
        if (files_changed.indexOf(path) === -1) {
          files_changed.push(path)
        }

        this
          .process(files_changed)
          .catch(console.error)
      })
  }

}

module.exports = WatchDir
