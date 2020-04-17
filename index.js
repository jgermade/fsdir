#!/usr/bin/env node

const { promisify } = require('util')
const { performance } = require('perf_hooks')
const { exec } = require('child_process')

const yargs = require('yargs')
const chokidar = require('chokidar')
const minimatch = require('minimatch')

const { yellow, cyan, magenta, black } = require('chalk')

const runCommand = promisify(exec)

function _round(num, decimals) {
  var _pow = Math.pow(10, decimals)
  return Math.round(num * _pow) / _pow
}

function _getmSeconds (time) {
  if( time > 1000 ) return _round(time/1000, 2) + 's'
  return _round(time, 2) + 'ms'
}

function _reduceWhen (when_list) {
  const when = []
  var current_when = null

  when_list.forEach( (param, i) => {
    if (i%2) {
      current_when.command = param
      when.push(current_when)
    } else current_when = {
      match: minimatch.filter(param.trim()),
    }
  })

  return when
}

const cmd = yargs
  .option('when', {
    type: 'array',
    nargs: 2,
    default: [],
  })
  .option('then', {
    alias: 't',
  })

!(function (argv) {

  const cwd = argv.cwd || '.'
    // console.log(argv)
    console.log(`${yellow('watching')}: ${cwd}`)

    const files_changed = []
    const when = _reduceWhen(argv.when)

    async function _runCommands (commands) {
      const next = commands.shift()

      if (!next) return

      var _start = performance.now()
      console.log(`${magenta('running')} ${next.command}`)
      await runCommand(next.command)
      console.log(`${cyan('finished')} ${next.command} ${black(_getmSeconds(performance.now() - _start))}`)

      await _runCommands(commands)
    }

    var processing_changes = false
    async function processChangedFiles () {
      // console.log('processChangedFiles', files_changed)

      const _files = files_changed.splice(0)

      if (!_files.length) return

      const commands = when
        .filter( (_pattern) => _files.some(_pattern.match) )

      if (argv.then) commands.push({ command: argv.then })

      console.log(`\n${ yellow('changed') }:\n ${_files.join('\n ') }`)

      if (!commands.length) {
        console.log(black('nothing to do'))
        return
      }

      processing_changes = true
      await _runCommands(commands)
      processing_changes = false

      if (files_changed.length) await processChangedFiles()

      console.log(``)
    }

    chokidar
      .watch('.', {
        cwd: cwd,
        ignoreInitial: true,
      })
      .on('all', (event, path) => {
        if (files_changed.indexOf(path) === -1) {
          files_changed.push(path)
        }

        if (!processing_changes) {
          processChangedFiles().catch(console.error)
        }
      })

})(cmd.argv)
