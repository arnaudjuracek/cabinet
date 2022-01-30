# `$ cabinet` <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/file-cabinet_1f5c4-fe0f.png" width="100" align="right">
**Personal cli tool to save web articles as markdown files**

<br>

## Philosophy

While some really complete options exist out there for saving articles from the web (Pocket, Instapaper, Evernote, etc…), they come with their proprietary client, do not always offer real archiving capabilities, and tend to be bloated by too much features. Also, Pocket search engine in its free version is garbage.

This tool adheres to the UNIX philosophy, and leverage your native file system as a way of storing and organizing articles. It saves articles in markdown format, and let you implement your own way of organizing, retrieving and reading content.

## Features

- Save an article to a markdown file using its URL
- Output the content to `stdout` or write it to a file and pipe its path
- Optionally save all medias along side the article in a custom folder
- Handle interpolated strings in filename and markdown template to re-use article informations
- That’s it.

## Installation

```
npm install --global arnaudjuracek/cabinet
```
<sup>**Note:** if using `fnm`, use either `npx arnaudjuracek/cabinet` or `yarn global add arnaudjuracek/cabinet`</sup>

## Usage
```
Usage
  cabinet <url>
  cabinet <url> --output <file>
  cabinet <url> --output <file> --download <dir>

  cabinet <url> > article.md
  open $(cabinet <url> --output /tmp/article.md)

Options
  -h, --help            Show this screen
  -v, --version         Print the current version
  -o, --output=<file>   Write to <file> instead of stdout. Stdout will instead
                        output the path of the written file.
  --download=<dir>      Define if and where article images should be downloaded
  --template=<file>     Specify an alternative template file


Interpolated strings
  In both --output and inside a markdown template, the following interpolated
  strings are available:

  {{ title }}           Article title
  {{ content }}         HTML string of processed article content
  {{ markdown }}        Markdown string of processed article content
  {{ textContent }}     Text content of the article, with all the HTML tags
                        removed
  {{ length }}          Length of an article, in characters
  {{ excerpt }}         Article description, or short excerpt from the content
  {{ byline }}          Author metadata
  {{ url }}             Article url
  {{ domain }}          Article domain
  {{ timestamp }}       Current date

  Note that interpolated strings in --output are slugged

```

### Example uses of `cabinet`

#### Save an article and tag it using [`tag`](https://github.com/jdberry/tag)

```bash
$ tag -a 'Unread' $(cabinet <url> --output 'my-article.md')
$ tag -a 'Unread' $(cabinet <url> --output '{{title}}.md')
$ tag -a 'Unread' $(cabinet <url> --output "$(date -f 'yyyymmdd')_{{title}}.md")
```

#### Read an article without creating a file using [`vmd`](https://github.com/yoshuawuyts/vmd)

```bash
$ cabinet <url> | vmd
```

#### Convert an article to pdf using [`pandoc`](https://github.com/jgm/pandoc)

```bash
$ pandoc $(cabinet <url> --output 'my-article.md') --toc --number-sections --output "my-article.pdf"
```

#### Migrate your pocket archive

```bash
# Get your keys at https://getpocket.com/developer/docs/authentication
POCKET_CONSUMER_KEY='…'
POCKET_ACCESS_TOKEN='…'
POCKET_URL='https://getpocket.com/v3/get'
POCKET_AUTH="consumer_key=$POCKET_CONSUMER_KEY&access_token=$POCKET_ACCESS_TOKEN"

for url in $(jq -r '.list[]? | .resolved_url' <<< $(curl -s -d "$POCKET_AUTH&state=all" -X POST $POCKET_URL)); do
  cabinet $url --output "pocket-dump/{{title}}.md" --download "pocket-dump/medias";
done

```
<sup>**Note:** the above script relies on [`jq`](https://stedolan.github.io/jq/) to parse the Pocket API response.</sup>

#### Programmatic

```js
const path = require('path')
const cabinet = require('arnaudjuracek/cabinet')

cabinet(url, {
  output: path.join(process.cwd(), '{{title}}.md'),
  download: path.join(process.cwd(), 'medias'),
  template: path.join(process.cwd(), 'template.md')
})
.then(filename => {
  console.log('Saved to ' + filename)
})
.catch(error => {
  console.error(error)
})

```

## Disclaimer

This tool is intended for my personal use, and any update may break your workflow. Use it at your own risk.

Feel free to open any issue or PR, but do not expect any active maintenance.

## License

[MIT.](https://tldrlegal.com/license/mit-license)
