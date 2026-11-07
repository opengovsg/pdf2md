// @flow

const ToLineItemBlockTransformation = require('../ToLineItemBlockTransformation')
const ParseResult = require('../../ParseResult')
const Word = require('../../Word')
const { MODIFIED_ANNOTATION, UNCHANGED_ANNOTATION } = require('../../Annotation')
const BlockType = require('../../markdown/BlockType')

// List markers less than this many points apart in x are on the same level
const X_TOLERANCE = 3

// Nests list items by comparing the x position of each item with the items before it.
// Every list item is its own block, so levels are tracked across consecutive list blocks.
module.exports = class DetectListLevels extends ToLineItemBlockTransformation {
  constructor () {
    super('Level Lists')
  }

  transform (parseResult /*: ParseResult */) /*: ParseResult */ {
    var listBlocks = 0
    var modifiedBlocks = 0
    parseResult.pages.forEach(page => {
      // The open levels, outermost first: the x of the level's items and the indent they get
      var levels = []
      var lastY
      page.items.forEach(block => {
        if (block.type !== BlockType.LIST) {
          levels = []
          return
        }
        listBlocks++
        // The first line starts the item; the lines after it are wrapped text
        const item = block.items[0]
        if (lastY !== undefined && item.y >= lastY) {
          // Not below the previous item: a new column, so a new list
          levels = []
        }
        lastY = block.items[block.items.length - 1].y
        while (levels.length > 0 && item.x < levels[levels.length - 1].x - X_TOLERANCE) {
          levels.pop()
        }
        const parent = levels[levels.length - 1]
        if (!parent || item.x > parent.x + X_TOLERANCE) {
          levels.push({ x: item.x, indent: parent ? parent.childIndent : 0 })
        }
        const level = levels[levels.length - 1]
        // A sub-item has to line up with the text after this item's marker ("- " or "10. ")
        level.childIndent = level.indent + (item.words.length > 0 ? item.words[0].string.length + 1 : 2)

        if (level.indent > 0) {
          // linesToText adds one space between this word and the marker
          item.words = [new Word({ string: ' '.repeat(level.indent - 1) })].concat(item.words)
          modifiedBlocks++
          block.annotation = MODIFIED_ANNOTATION
        } else {
          block.annotation = UNCHANGED_ANNOTATION
        }
      })
    })

    return new ParseResult({
      ...parseResult,
      messages: ['Modified ' + modifiedBlocks + ' / ' + listBlocks + ' list blocks.'],
    })
  }
}
