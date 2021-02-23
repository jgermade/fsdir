
import { makeRe } from 'minimatch'

export function matchFilters (filters: [string]): Function {
  const _filters = filters.map(
    pattern => {
      return pattern[0] === '!'
        ? {
            exclusion: true,
            re: makeRe(pattern.substr(1)),
          }
        : { re: makeRe(pattern) }
    }
  )

  return (file_path: string) => {
    var matched = false
    
    _filters.forEach(_ => {
      const { exclusion = false, re } = _
      if (exclusion) {
        if (matched && re.test(file_path) === true) matched = false
      } else if (!matched && re.test(file_path) === true) {
        matched = true
      }
    })
    
    return matched
  }
}
