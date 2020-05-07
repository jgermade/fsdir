#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const { performance } = require('perf_hooks')

const { yellow, cyan, magenta, black } = require('chalk')

const { reducePatterns, reducePromises, runCommand, getFileENV, getmSeconds } = require('./helpers')
const { each } = require('./each')
const WatchDir = require('./watchdir')

const { argv } = yargs
  .option('dir', {
    alias: 'd',
    type: 'string',
    default: '.',
  })
  .option('stdout', {
    type: 'boolean',
    default: true,
  })
  .option('stderr', {
    type: 'boolean',
    default: true,
  })
  .option('concurrent', {
    alias: 'c',
    type: 'boolean',
    nargs: 0,
  })
  .option('each', {
    alias: 'p',
    type: 'array',
    nargs: 2,
    default: [],
  })
  .option('watch', {
    alias: 'w',
    type: 'array',
    nargs: 2,
    default: [],
  })
  .option('after-watch', {
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


async function processDirCommands (argv) {
  const each_patterns = reducePatterns(argv.each)
  const watch_patterns = reducePatterns(argv.watch)
  const afterwatch_patterns = reducePatterns(argv.afterWatch)
  const cwd = argv.dir
  
  const each_pattern = each_patterns.map( (pattern) => async () => {
    await each(pattern.pattern, {
      cwd,
    }, async (filepath) => {
      await runCommand(pattern.command, {
        env: Object.assign(Object.create(process.env), getFileENV(filepath, { cwd }) ),
        stdout: argv.stdout,
        stderr: argv.stderr,
      })
    })
  })

  await ( argv.concurrent
    ? Promise.all( each_pattern.map( (run) => run() ) )
    : reducePromises(each_pattern)
  )

  if (!watch_patterns.length && !afterwatch_patterns.length) return

  const watcher = new WatchDir(cwd)

  async function _runCommand (command) {
    var _start = performance.now()
    argv.verbose && console.log(`\n${magenta('running')} ${command}`)
    await runCommand(command, {
      stdout: argv.stdout,
      stderr: argv.stderr,
    })
    argv.verbose && console.log(`${cyan('finished')} ${command} ${black(getmSeconds(performance.now() - _start))}`)
  }

  watch_patterns.forEach( (_watch) => {
    watcher.when(_watch.pattern, () => _runCommand(_watch.command) )
  })

  afterwatch_patterns.forEach( (_awatch) => {
    watcher.run( () => _runCommand(_awatch.command) )
  })

  argv.verbose && console.log(`\n${yellow('watching')}: ${cwd}`)
  argv.verbose && watcher.run( () => console.log(`\n${yellow('waiting')}...`) )
}

processDirCommands(argv)
