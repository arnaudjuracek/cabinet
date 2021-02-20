# `$ cabinet` <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/apple/271/file-cabinet_1f5c4-fe0f.png" width="100" align="right">
**Personal cli tool to save web articles as markdown files**

<br>

## Philosophy

While some really complete options exist out there for saving articles from the web (Pocket, Instapaper, Evernote, etc…), they come with their proprietary client, do not always offer real archiving capabilities, and tend to be bloated by too much features.

This tool adheres to the UNIX philosophy, and leverage your native file system as a way of storing and organizing articles. It saves articles in markdown format, and let you implement your own way of organizing, retrieving and reading content.

## Features

- Save an article to a markdown file using its URL
- Optionally save all medias along side the article in a `medias/` folder
- Output the saved file to `stdout` using `--porcelain` (useful for piping)
- Output the article to `stdout` instead of writing to a file using `-n, --dry`
- That’s it.

## Installation

```
npm install --global arnaudjuracek/cabinet
```

## Usage
```
$ cabinet

Usage:
  cabinet <url>
  cabinet <url> --output <path>
  cabinet <url> --output <path> --download-images

  echo $(cabinet <url> --dry) > file.md
  open $(cabinet <url> --output /tmp/ --porcelain)

Options:
  -h, --help         Show this screen
  -v, --version      Print the current version
  --verbose          Log additional informations to stderr
  --porcelain        Only output the markdown file path when finish

  -n, --dry          Output the article in stdout instead of writing a file.
                     Force --porcelain, disable --output and --download-images

  -o, --output       Define the output directory (default: $PWD)
  --download-images  Download all images of the article in a medias/ directory
```

### Example uses of `cabinet`

#### Save an article and tag it using [`tag`](https://github.com/jdberry/tag)

```bash
$ tag -a 'Unread' $(cabinet <url> --porcelain)
```

#### Read an article without creating a file using [`vmd`](https://github.com/yoshuawuyts/vmd)
```bash
$ cabinet <url> --dry | vmd
```

#### Convert an article to pdf using [`pandoc`](https://github.com/jgm/pandoc)

```bash
$ pandoc $(cabinet <url> --porcelain) --toc --number-sections --output "my-article.pdf"
```

#### Migrate your pocket archive

```bash
# Get your keys at https://getpocket.com/developer/docs/authentication
POCKET_CONSUMER_KEY='…'
POCKET_ACCESS_TOKEN='…'
POCKET_URL='https://getpocket.com/v3/get'
POCKET_AUTH="consumer_key=$POCKET_CONSUMER_KEY&access_token=$POCKET_ACCESS_TOKEN"

for url in $(jq -r '.list[]? | .resolved_url' <<< $(curl -s -d "$POCKET_AUTH&state=all" -X POST $POCKET_URL)); do
  cabinet $url --output "pocket-dump" --download-images;
done

```
<sup>**Note:** the above script relies on [`jq`](https://stedolan.github.io/jq/) to parse the Pocket API response.</sup>


## Disclaimer

This tool is intended for my personal use, and any update may break your workflow. Use it at your own risk.

Feel free to open any issue or PR, but do not expect any active maintenance.

## License

[MIT.](https://tldrlegal.com/license/mit-license)
