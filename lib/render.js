const fs = require('fs-extra')
const Turndown = require('turndown')

function interpolate (article, string) {
  Object.entries(article).forEach(([key, value]) => {
    const tag = new RegExp(`{{ ?${key} ?}}`, 'gi')
    string = string.replace(tag, value)
  })
  return string
}

function safeFrontMatterValue (string) {
  return string ? string.replace(/[\t|\s]+/g, ' ') : undefined
}

module.exports = {
  interpolate,
  markdown: (article, template) => {
    let output = fs.readFileSync(template, 'utf8')

    // Convert HTML to markdown
    article.markdown = new Turndown({
      headingStyle: 'atx',
      hr: '---',
      emDelimiter: '_',
      strongDelimiter: '**',
      linkStyle: 'referenced',
      linkReferenceStyle: 'full',
      codeBlockStyle: 'fenced'
    }).addRule('strikethrough', {
      filter: ['del', 's', 'strike'],
      replacement: content => '~' + content + '~'
    }).addRule('pre', {
      filter: 'pre',
      replacement: content => '```\n' + content + '\n```'
    }).turndown(article.content)

    // Ensure byline is always on a single line
    if (article.byline) article.byline = article.byline.replace(/\r?\n|\r/g, '')

    article.title = safeFrontMatterValue(article.title)
    article.excerpt = safeFrontMatterValue(article.excerpt)
    article.byline = safeFrontMatterValue(article.byline)

    // Replace all relevant {{tags}} by their couterparts from the article
    output = interpolate(article, output)

    // Clean up some Turndown quirks:
    output = output
      // Remove **word** formating inside headings
      .replace(/^(#+\s?)\*{2}(.*)\*{2}$/gm, '$1$2')
      // Remove line breaks in images wrapped inside links
      .replace(/\[(\n+)(!.*)(\n+)\]\[(\d+)\]/g, '[$2][$4]')
      // Handle heading wrapped inside links
      .replace(/\[\n+(#{1,6})\s(.*)\n+]\[(.*)\]/g, '$1 [$2][$3]')

    return output
  }
}
