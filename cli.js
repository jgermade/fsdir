#!/usr/bin/env node

const yargs = require('yargs')
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
  .option('debounce-watch', {
    type: 'boolean',
    default: false,
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    nargs: 1,
    // default: ( process.env.MAKEFLAGS && /s/.test(process.env.MAKEFLAGS) ? false : true ),
    default: true,
  })

async function processDirCommands (argv) {
  const eachPatterns = reducePatterns(argv.each)
  const watchPatterns = reducePatterns(argv.watch)
  const cwd = argv.dir
  const { debounceWatch } = argv

  const eachPattern = eachPatterns.map(
    (pattern) => async () => {
      await each(pattern.pattern, {
        cwd,
      }, async (filepath) => {
        await runCommand(pattern.command, {
          env: getFileENV(filepath, { cwd }),
          stdout: argv.stdout,
          stderr: argv.stderr,
        })
      })
    }
  )

  await (argv.concurrent
    ? Promise.all(eachPattern.map(
      (run) => run())
    )
    : reducePromises(eachPattern)
  )

  if (!watchPatterns.length) return

  const watcher = new WatchDir(cwd, { debounceWatch })

  async function _runCommand (command, env = process.env) {
    var _start = performance.now()
    // eslint-disable-next-line no-console
    argv.verbose && console.log(`\n${magenta('running')} ${command}`)
    await runCommand(command, {
      env,
      stdout: argv.stdout,
      stderr: argv.stderr,
    })
      .catch(console.error) // eslint-disable-line no-console
    // eslint-disable-next-line no-console
    argv.verbose && console.log(`${cyan('finished')} ${black(getmSeconds(performance.now() - _start))}`)
  }

  watchPatterns.forEach(
    (_watch) => {
      watcher.when(
        _watch.pattern,
        (filepath) => _runCommand(
          _watch.command,
          getFileENV(filepath[0], { cwd })
        )
      )
    }
  )

  argv.afterWatch.forEach((command) => {
    watcher.run(() => _runCommand(command))
  })

  /* eslint-disable no-console */
  argv.verbose && console.log(`\n${yellow('watching')}: ${cwd}`)
  argv.verbose && watcher.run(() => {
    console.log(`\n${yellow('waiting')}...`)
  })
  /* eslint-enable no-console */
}

processDirCommands(argv)
