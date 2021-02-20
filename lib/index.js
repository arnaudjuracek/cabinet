const fs = require('fs-extra')
const path = require('path')
const { Readability } = require('@mozilla/readability')
const { JSDOM, VirtualConsole } = require('jsdom')
const download = require('download')
const { yellow, blue, red } = require('chalk')

const render = require('./render')
const slugify = require('./utils/slugify')
const yyyymmdd = require('./utils/yyyymmdd')

const REGEX = {
  markdownImages: /!\[.*?\]\(.*?\)/g,
  markdownImageUrl: /!\[.*?\]\((https?:\/\/[^\s()]+).*?\)/
}

module.exports = async function ({
  url = null,
  dry = false,
  output = process.cwd(),
  template = path.join(__dirname, 'template.md'),
  downloadImages = false,
  verbose = false,
  porcelain = false
} = {}) {
  if (!url) throw new Error('No URL given')
  if (dry) porcelain = true

  verbose && console.error(blue('→ Fetching ') + url)

  // Suppress JSDOM error
  const virtualConsole = new VirtualConsole()
  virtualConsole.sendTo(console, { omitJSDOMErrors: !verbose })

  // Fetch a webpage from an url and construct a window object using JSDom
  const { window } = await JSDOM.fromURL(url, { virtualConsole })

  // Remove all <script> to avoid potential malicious Javascript injections
  const scripts = window.document.querySelectorAll('script')
  for (const script of scripts) script.remove()

  // Parse the article and render it
  const now = new Date()
  const reader = new Readability(window.document)
  const article = Object.assign({}, reader.parse(), { url, timestamp: +now })
  if (!article.title) article.title = path.basename(url)
  article.uri = yyyymmdd(now) + '_' + slugify(article.title, { preserveExtension: false })

  let markdown = render(article, template)
  if (dry) return markdown

  // Find all images in the markdown and download their sources to output/medias
  // Replace their url inside the markdown by their local path
  if (downloadImages) {
    const medias = path.join(output, 'medias')
    const imageTags = markdown.match(REGEX.markdownImages) || []
    await Promise.all(imageTags.map(async tag => {
      const url = tag.match(REGEX.markdownImageUrl)[1]
      if (!url) return

      const filename = article.uri + '_' + slugify(path.basename(url.replace(/\?.*/, '')))
      verbose && console.error(yellow('→ Downloading ') + url)
      try {
        await download(url, medias, { filename })
        markdown = markdown.replace(
          tag,
          tag.replace(url, path.relative(output, path.join(medias, filename)))
        )
      } catch (error) {
        const code = error.statusCode
        console.error(code
          ? red(`✖ Error ${code} while downloading `) + url
          : red(`✖ Error ${error.message} while downloading `) + url)
        console.error(yellow('→ Conserving original URL instead'))
      }
    }))
  }

  // Write the article file
  const file = path.join(output, article.uri + '.md')
  await fs.outputFile(file, markdown)

  return file
}
