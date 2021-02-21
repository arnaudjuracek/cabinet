const fs = require('fs-extra')
const Turndown = require('turndown')

module.exports = (article, template) => {
  let output = fs.readFileSync(template, 'utf8')

  // Convert HTML to markdown
  article.content = new Turndown({
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

  // Replace all relevant {{tags}} by their couterparts from the article
  Object.entries(article).forEach(([key, value]) => {
    const tag = new RegExp(`{{ ? ${key} ?}}`, 'gi')
    output = output.replace(tag, value)
  })

  // Clean up some Turndown quirks:
  // Remove **word** formating inside headings
  output = output.replace(/^(#+\s?)\*{2}(.*)\*{2}$/gm, '$1$2')

  // Handle heading wrapped in links
  output = output.replace(/\[\n+(#{1,6})\s(.*)\n+]\[(.*)\]/g, '$1 [$2][$3]')

  return output
}
