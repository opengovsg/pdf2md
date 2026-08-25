// @flow

const Transformation = require('./Transformation')
const ParseResult = require('../ParseResult')

module.exports = class ToMarkdown extends Transformation {
  constructor () {
    super('To Markdown', 'String')
  }

  transform (parseResult /*: ParseResult */) /*: ParseResult */ {
    parseResult.pages.forEach(page => {
      var text = ''
      page.items.forEach(block => {
        // Concatenate all words in the same block, unless it's a Table of Contents block
        let concatText
        if (block.category === 'TOC') {
          concatText = block.text
        } else {
          concatText = block.text.replace(/(\r\n|\n|\r)/gm, ' ')
        }

        // Concatenate words that were previously broken up by newline
        // (handled below per block type)

        // Ensure each bullet point starts on its own line
        concatText = concatText.replace(/ • /g, '\n• ')

        // Concatenate words that were previously broken up by newline
        // Only remove hyphens at line breaks (word continuation), not in content
        if (block.category !== 'LIST') {
          concatText = concatText.replace(/(\w)- \n(\w)/g, '$1$2')
        }

        // Assume there are no code blocks in our documents
        if (block.category === 'CODE') {
          concatText = concatText.split('`').join('')
        }

        text += concatText + '\n\n'
      })

      page.items = [text]
    })
    return new ParseResult({
      ...parseResult,
    })
  }
}
