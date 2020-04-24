#!/usr/bin/env node

const { performance } = require('perf_hooks')

const yargs = require('yargs')
const { yellow, cyan, magenta, black } = require('chalk')

const { getmSeconds, runCommand } = require('./utils')
const WatchDir = require('./watchdir')

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
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    nargs: 1,
    // default: ( process.env.MAKEFLAGS && /s/.test(process.env.MAKEFLAGS) ? false : true ),
    default: true,
  })

const cwd = argv.dir || '.'
const watch = new WatchDir(cwd)

_reduceWhen(argv.when)
  .forEach( (_) => {
    watch.when(_.pattern, () => _runCommand(_.command) )
  })

async function _runCommand (command) {
  var _start = performance.now()
  argv.verbose && console.log(`\n${magenta('running')} ${command}`)
  await runCommand(command)
  argv.verbose && console.log(`${cyan('finished')} ${command} ${black(getmSeconds(performance.now() - _start))}`)
}

argv.run.forEach( (command) => {
  watch.run(() => _runCommand(command))
})

argv.verbose && console.log(`\n${yellow('watching')}: ${cwd}`)
