#!/usr/bin/env node

const { promisify } = require('util')
const { performance } = require('perf_hooks')
const { exec } = require('child_process')

const yargs = require('yargs')

const { yellow, cyan, magenta, black } = require('chalk')

const WatchDir = require('./watchdir')

const runCommand = promisify(exec)

console.log('WatchDir', WatchDir)

function _reduceWhen (when_list) {
  const when = []
  var current_when = null

  when_list.forEach( (param, i) => {
    if (i%2) {
      current_when.command = param
      when.push(current_when)
    } else current_when = {
      pattern: param.trim(),
    }
  })

  return when
}

const { argv } = yargs
  .option('when', {
    alias: 'w',
    type: 'array',
    nargs: 2,
    default: [],
  })
  .option('then', {
    alias: 't',
    type: 'array',
    nargs: 1,
    default: [],
  })

const cwd = argv.cwd || '.'
const watch = new WatchDir(cwd)

_reduceWhen(argv.when)
  .forEach( (_) => {
    watch.when(_.patten, async () => {
      return await runCommand(_.command)
    })
  })

argv.then.forEach( (command) => {
  watch.then(async () => {
    return await runCommand(command)
  })
})
