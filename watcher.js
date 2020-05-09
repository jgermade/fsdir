
const { reducePromises } = require('./helpers')
const arrayPush = Array.prototype.push

class Watcher {
  constructor (options = {}) {
    this.options = options
    this.when_queue = []
    this.run_queue = []
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

    const _this = this
    const _args = arguments

    const queue = this.when_queue.filter((_) => _.when.apply(_this, _args))
    
    if (queue.length) arrayPush.apply(queue, this.run_queue)

    this.processing_changes = true
    return await reducePromises(
      queue.map((_) => () => _.cbFn.apply(_this, _args))
    )
      .then((result) => {
        this.processing_changes = false
        return result
      })
  }
}

module.exports = Watcher
