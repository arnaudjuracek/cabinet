#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const pkg = require('../package.json')
const { green, red } = require('chalk')

const argv = require('minimist')(process.argv.slice(2), {
  alias: { h: 'help', v: 'version', o: 'output', n: 'dry' },
  boolean: ['help', 'version', 'verbose', 'porcelain', 'dry', 'download-images'],
  string: ['output']
})

if (argv.help) {
  console.log(pkg.name)
  console.log(pkg.description, '\n')
  console.log(fs.readFileSync(path.join(__dirname, 'USAGE'), 'utf8'))
  process.exit(0)
}

if (argv.version) {
  console.log(pkg.version)
  process.exit(0)
}

require('../lib')(Object.assign({}, argv, {
  url: argv._[0],
  downloadImages: argv['download-images']
})).then(result => {
  if (argv.porcelain || argv.dry) {
    console.log(result)
    return
  }

  console.error(green('✔ File created ') + path.relative(process.cwd(), result))
}).catch(e => {
  if (e.statusCode) {
    console.error(red('✖ Error ' + e.statusCode))
    process.exit(1)
  }

  console.error(red('✖ ' + (e.stack || 'Error :' + e.message)))
  console.error(`Try '${pkg.name} --help' or '${pkg.name} --verbose'`)
  process.exit(1)
})
