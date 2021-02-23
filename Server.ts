
const http = require('http')

interface ServerOptions {
  root_dir: string
  try_files?: (string|number)[]
  error_404?: string
}

class Server implements ServerOptions {
  root_dir = null
  try_files = ['index.html', 404]
  error_404 = null

  constructor (options: ServerOptions) {
    const {
      root_dir = '.',
      try_files,
      error_404,
    } = options

    this.root_dir = root_dir
    this.try_files = try_files
    this.error_404 = error_404
  }

  listen (host: string, post: number) {

  }
}

module.exports = Server
