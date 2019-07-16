const Transformation = require('./Transformation')
const ParseResult = require('../ParseResult')
const { blockToText } = require('../markdown/BlockType')

module.exports = class ToTextBlocks extends Transformation {
  constructor () {
    super('To Text Blocks', 'TextBlock')
  }

  transform (parseResult /*: ParseResult */) /*: ParseResult */ {
    parseResult.pages.forEach(page => {
      const textItems = []
      page.items.forEach(block => {
        // TODO category to type (before have no unknowns, have paragraph)
        const category = block.type ? block.type.name : 'Unknown'
        textItems.push({
          category: category,
          text: blockToText(block),
        })
      })
      page.items = textItems
    })
    return new ParseResult({
      ...parseResult,
    })
  }
}
