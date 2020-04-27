#!/usr/bin/env node

const yargs = require('yargs')
const path = require('path')
const { reducePatterns, reducePromises, runCommand, getFileENV } = require('./helpers')
const { forEach } = require('./foreach')

const { argv } = yargs
  .option('cwd', {
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
  .option('pattern', {
    alias: 'p',
    type: 'array',
    nargs: 2,
    demand: true,
    // default: [],
  })


async function processForEach (argv) {
  const patterns = reducePatterns(argv.pattern)

  const each_pattern = patterns.map( (pattern) => async () => {
    await forEach(pattern.pattern, {
      cwd: argv.cwd,
    }, async (filepath) => {
      await runCommand(pattern.command, {
        env: Object.assign(Object.create(process.env), getFileENV(filepath, { cwd: argv.cwd }) ),
        cwd: argv.cwd ? path.resolve(process.cwd(), argv.cwd) : process.cwd(),
        stdout: argv.stdout,
        stderr: argv.stderr,
      })
    })
  })

  return await ( argv.concurrent
    ? Promise.all( each_pattern.map( (run) => run() ) )
    : reducePromises(each_pattern)
  )
}

processForEach(argv)
