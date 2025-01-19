# pdf2md

JavaScript npm library to parse PDF files and convert them into Markdown

## Major Changes

See [Releases](https://github.com/opendocsg/pdf2md/releases)

## Usage

### Library

```js
const path = require('path');
const fs = require('fs')
const pdf2md = require('@opendocsg/pdf2md')

const pdfBuffer = fs.readFileSync(filePath)
pdf2md(pdfBuffer, callbacks)
  .then(text => {
    let outputFile = allOutputPaths[i] + '.md'
    console.log(`Writing to ${outputFile}...`)
    fs.writeFileSync(path.resolve(outputFile), text)
    console.log('Done.')
  })
  .catch(err => {
    console.error(err)
  })
```

### CLI tool

```
$ cd [project_folder]
$ npx @opendocsg/pdf2md --inputFolderPath=[your input folder path] --outputFolderPath=[your output folder path] --recursive
```

If you are converting recursively on a large number of files you might encounter the error "Allocation failed - JavaScript heap out of memory”. Instead, run the command

```
$ node lib/pdf2md-cli.js --max-old-space-size=4096 --inputFolderPath=[your input folder path] --outputFolderPath=[your output folder path] --recursive
```

Options:
1. Input folder path (should exist)
2. Output folder path (should exist)
3. Recursive - convert all PDFs for folders within folders. Specify the tag if you require recursive, and omit if you don't

## Credits

[pdf-to-markdown](https://github.com/jzillmann/pdf-to-markdown) - original project by Johannes Zillmann  
[pdf.js](https://mozilla.github.io/pdf.js/) - Mozilla's PDF parsing & rendering platform which is used as a raw parser
