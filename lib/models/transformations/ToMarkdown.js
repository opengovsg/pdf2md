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
          // Rejoin words hyphenated across a line break ("infor-\nmation" -> "information").
          // Only hyphens at the end of a line, before a lowercase letter, so "2019 - 2021" keeps its hyphen.
          // This has to run before the newlines are replaced.
          concatText = block.text.replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2')
          concatText = concatText.replace(/(\r\n|\n|\r)/gm, ' ')
        }

        // Ensure each bullet point starts on its own line
        concatText = concatText.replace(/ • /g, '\n• ')

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
