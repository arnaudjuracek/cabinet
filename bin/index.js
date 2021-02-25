#!/usr/bin/env node
const fs = require('fs-extra')
const path = require('path')
const pkg = require('../package.json')

const argv = require('minimist')(process.argv.slice(2), {
  alias: { h: 'help', v: 'version', o: 'output' },
  boolean: ['help', 'version'],
  string: ['output', 'download', 'template']
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

require('../lib')(argv._[0], argv).then(result => {
  console.log(result)
  process.exit(0)
}).catch(e => {
  console.error('Error ' + (e.statusCode ? e.statusCode : e.message))
  process.exit(1)
})
