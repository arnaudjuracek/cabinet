const fs = require('fs-extra')
const Turndown = require('turndown')

function interpolate (article, string) {
  Object.entries(article).forEach(([key, value]) => {
    const tag = new RegExp(`{{ ?${key} ?}}`, 'gi')
    string = string.replace(tag, value)
  })
  return string
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
    article.byline = article.byline.replace(/\r?\n|\r/g, '')
    // Remove all tab chars inside byline, to prevent syntax error when used in
    // front matter blocks
    article.byline = article.byline.replace(/\t+/g, ' ')

    // Replace all relevant {{tags}} by their couterparts from the article
    output = interpolate(article, output)

    // Clean up some Turndown quirks:
    // Remove **word** formating inside headings
    output = output.replace(/^(#+\s?)\*{2}(.*)\*{2}$/gm, '$1$2')

    // Handle heading wrapped in links
    output = output.replace(/\[\n+(#{1,6})\s(.*)\n+]\[(.*)\]/g, '$1 [$2][$3]')

    return output
  }
}
