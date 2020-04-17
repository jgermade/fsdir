#!/usr/bin/env node

const chokidar = require('chokidar')
const minimatch = require('minimatch')

const Watcher = require('./watcher')

class WatchDir extends Watcher {

  constructor (cwd = '.', options = {}) {
    if (typeof cwd === 'object') {
      options = cwd
      cwd = options.dir || '.'
    }
    this.cwd = cwd
    this.options = options

    super(options)

    if (!options.manual_boot) this.watch(cwd)
  }

  when (pattern, cbFn) {
    this.when_queue.push({
      when: minimatch.filter(pattern),
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

        if (!processing_changes) {
          this
            .process( (when) => {

            })
            .catch(console.error)
        }
      })
  }

}

module.exports = WatchDir
