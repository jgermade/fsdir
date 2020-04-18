
const { runPromises } = require('./utils')

class Watcher {

  constructor (options = {}) {
    this.options = options
    this.when_queue = []
    this.run_queue = []
    this.files_changed = []
    this.processing_changes = false
  }

  when (when, cbFn) {
    this.when_queue.push({ when, cbFn })
    return this
  }

  run (cbFn) {
    this.run_queue.push({ cbFn })
    return this
  }

  async process () {
    if (this.processing_changes) return

    const _this = this, _args = arguments
    const queue = this.when_queue
      .filter( (_) => _.when.apply(_this, _args) )
      .concat(this.run_queue)
      .map( (_) => _.cbFn )

    this.processing_changes = true
    return await runPromises(queue)
      .then( (result) => {
        this.processing_changes = false
        return result
      })
  }

}

module.exports = Watcher
