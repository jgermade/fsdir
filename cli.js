#!/usr/bin/env node

const { performance } = require('perf_hooks')

const yargs = require('yargs')
const { yellow, cyan, magenta, black } = require('chalk')

const { getmSeconds, runCommand } = require('./utils')
const WatchDir = require('./watchdir')

async function _runCommand (command) {
  var _start = performance.now()
  console.log(`\n${magenta('running')} ${command}`)
  await runCommand(command)
  console.log(`${cyan('finished')} ${command} ${black(getmSeconds(performance.now() - _start))}`)
}

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
  .option('dir', {
    alias: 'd',
    default: '.',
  })
  .option('when', {
    alias: 'w',
    type: 'array',
    nargs: 2,
    default: [],
  })
  .option('run', {
    alias: 'r',
    type: 'array',
    nargs: 1,
    default: [],
  })

const cwd = argv.dir || '.'
const watch = new WatchDir(cwd)

_reduceWhen(argv.when)
  .forEach( (_) => {
    watch.when(_.pattern, () => _runCommand(_.command) )
  })

argv.run.forEach( (command) => {
  watch.run(() => _runCommand(command))
})

console.log(`\n${yellow('watching')}: ${cwd}`)
