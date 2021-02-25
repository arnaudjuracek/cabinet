const fs = require('fs-extra')
const path = require('path')
const { Readability } = require('@mozilla/readability')
const { JSDOM, VirtualConsole } = require('jsdom')
const downloadFile = require('download')

const Render = require('./render')
const slugify = require('./utils/slugify')

const REGEX = {
  markdownImages: /!\[.*?\]\(.*?\)/g,
  markdownImageUrl: /!\[.*?\]\((https?:\/\/[^\s()]+).*?\)/
}

module.exports = async function (url, {
  output = null,
  download = null,
  template = path.join(__dirname, 'template.md')
} = {}) {
  if (!url) throw new Error('No URL given')

  // Suppress JSDOM error
  const virtualConsole = new VirtualConsole()
  virtualConsole.sendTo(console, { omitJSDOMErrors: true })

  // Fetch a webpage from an url and construct a window object using JSDom
  const { window } = await JSDOM.fromURL(url, { virtualConsole })

  // Remove all <script> to avoid potential malicious Javascript injections
  const scripts = window.document.querySelectorAll('script')
  for (const script of scripts) script.remove()

  // Parse and render the article
  const reader = new Readability(window.document)
  const article = Object.assign({}, reader.parse(), {
    url,
    timestamp: Date.now(),
    domain: new URL(url).hostname
  })
  if (!article.title) article.title = path.basename(url)
  article.markdown = Render.markdown(article, template)

  // Attach additional file informations to the article
  if (output) {
    const ext = path.extname(output)
    article.dir = path.dirname(output)
    article.uri = slugify(Render.interpolate(article, path.basename(output, ext)))
    article.file = path.join(article.dir, article.uri + ext)
  }

  // Write the necessary files
  if (download) await downloadImages(article, download)
  if (output) await fs.outputFile(article.file, article.markdown)

  // Return either the path of the written article or its plain markdown
  return article.file || article.markdown
}

async function downloadImages (article, dir) {
  // Find all images tag
  for (const tag of article.markdown.match(REGEX.markdownImages) || []) {
    const matches = tag.match(REGEX.markdownImageUrl)
    const url = matches && matches[1]
    if (!url) continue

    const slug = slugify(path.basename(url.replace(/\?.*/, '')))
    try {
      // Download image
      const filename = article.file ? `${article.uri}_${slug}` : slug
      await downloadFile(url, dir, { filename })

      // Update the markdown to replace the image url by its path
      const imagePath = article.dir
        ? path.relative(article.dir, path.join(dir, filename))
        : path.join(dir, filename)
      article.markdown = article.markdown.replace(tag, tag.replace(url, imagePath))
    } catch (error) {
      const code = error.statusCode
      console.error(code
        ? `Error ${code} while downloading ${url}`
        : `Error ${error.message} while downloading ${url}`)
      console.error('  Conserving original URL instead')
    }
  }

  return article
}
