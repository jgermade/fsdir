const { runPromises } = require('./utils')

class Watcher {

  constructor (options = {}) {
    this.options = options
    this.when_queue = []
    this.then_queue = []
    this.files_changed = []
    this.processing_changes = false
  }

  when (when, cbFn) {
    when_queue.push({ when, cbFn })
    return this
  }

  then (cbFn) {
    then_queue.push({ cbFn })
    return this
  }

  async process () {
    if (this.processing_changes) return

    const { onProcessingStart, onProcessingEnd } = this.options

    const queue = this.when_queue
      .filter( (_) => _.when.apply(this, arguments) )
      .concat(this.then_queue)
      .map( (_) => _.cbFn )

    this.processing_changes = true
    return await runPromises(queue, {
      onStart: onProcessingStart && onProcessingStart.bind(this),
      onEnd: onProcessingEnd && onProcessingEnd.bind(this),
    })
      .then( (result) => {
        this.processing_changes = false
        return result
      })
  }

}

module.exports = Watcher
