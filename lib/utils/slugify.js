const path = require('path')

module.exports = (string, {
  preserveExtension = true
} = {}) => {
  const ext = path.extname(string) || ''
  if (preserveExtension) string = string.replace(ext, '')

  string = string
    // Strip accents
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    // Replace non-matching chars by -
    .replace(/[^a-zA-Z0-9]/g, '-')
    // Dedup successive -
    .replace(/(-+)/g, '-')
    // Remove leading and trailing -
    .replace(/^-|-$/, '')
    .toLowerCase()
    // Handle ENAMETOOLONG
    .substr(0, 200)

  return string + (preserveExtension ? ext : '')
}
