// @flow

/*::
import LineItemBlock from '../LineItemBlock'
*/

const { Enum } = require('enumify')

function firstFormat (lineItem) {
  if (lineItem.words.length === 0) {
    return null
  }
  return lineItem.words[0].format
}

function isPunctationCharacter (string) {
  if (string.length !== 1) {
    return false
  }
  return string[0] === '.' || string[0] === '!' || string[0] === '?'
}

function linesToText (lineItems, disableInlineFormats) {
  var text = ''
  var openFormat

  const closeFormat = () => {
    text += openFormat.endSymbol
    openFormat = null
  }

  lineItems.forEach((line, lineIndex) => {
    line.words.forEach((word, i) => {
      const wordType = word.type
      const wordFormat = word.format
      if (openFormat && (!wordFormat || wordFormat !== openFormat)) {
        closeFormat()
      }

      if (i > 0 && !(wordType && wordType.attachWithoutWhitespace) && !isPunctationCharacter(word.string)) {
        text += ' '
      }

      if (wordFormat && !openFormat && (!disableInlineFormats)) {
        openFormat = wordFormat
        text += openFormat.startSymbol
      }

      if (wordType && (!disableInlineFormats || wordType.plainTextFormat)) {
        text += wordType.toText(word.string)
      } else {
        text += word.string
      }
    })
    if (openFormat && (lineIndex === lineItems.length - 1 || firstFormat(lineItems[lineIndex + 1]) !== openFormat)) {
      closeFormat()
    }
    text += '\n'
  })
  return text
}

// An Markdown block
class BlockType extends Enum {

}

module.exports = BlockType

BlockType.initEnum({
  H1: {
    headline: true,
    headlineLevel: 1,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '# ' + linesToText(block.items, true)
    },
  },
  H2: {
    headline: true,
    headlineLevel: 2,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '## ' + linesToText(block.items, true)
    },
  },
  H3: {
    headline: true,
    headlineLevel: 3,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '### ' + linesToText(block.items, true)
    },
  },
  H4: {
    headline: true,
    headlineLevel: 4,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '#### ' + linesToText(block.items, true)
    },
  },
  H5: {
    headline: true,
    headlineLevel: 5,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '##### ' + linesToText(block.items, true)
    },
  },
  H6: {
    headline: true,
    headlineLevel: 6,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '###### ' + linesToText(block.items, true)
    },
  },
  TOC: {
    mergeToBlock: true,
    toText (block /*: LineItemBlock */) /*: string */ {
      return linesToText(block.items, true)
    },
  },
  FOOTNOTES: {
    mergeToBlock: true,
    mergeFollowingNonTypedItems: true,
    toText (block /*: LineItemBlock */) /*: string */ {
      return linesToText(block.items, false)
    },
  },
  CODE: {
    mergeToBlock: true,
    toText (block /*: LineItemBlock */) /*: string */ {
      return '```\n' + linesToText(block.items, true) + '```'
    },
  },
  LIST: {
    mergeToBlock: false,
    mergeFollowingNonTypedItemsWithSmallDistance: true,
    toText (block /*: LineItemBlock */) /*: string */ {
      return linesToText(block.items, false)
    },
  },
  PARAGRAPH: {
    toText (block /*: LineItemBlock */) /*: string */ {
      return linesToText(block.items, false)
    },
  },
})

module.exports.isHeadline = function isHeadline (type /*: BlockType */) /*: boolean */ {
  return type && type.name.length === 2 && type.name[0] === 'H'
}

module.exports.blockToText = function blockToText (block /*: LineItemBlock */) /*: string */ {
  if (!block.type) {
    return linesToText(block.items, false)
  }
  return block.type.toText(block)
}

module.exports.headlineByLevel = function headlineByLevel (level) {
  if (level === 1) {
    return BlockType.H1
  } else if (level === 2) {
    return BlockType.H2
  } else if (level === 3) {
    return BlockType.H3
  } else if (level === 4) {
    return BlockType.H4
  } else if (level === 5) {
    return BlockType.H5
  } else if (level === 6) {
    return BlockType.H6
  } else {
    // if level is >= 6, just use BlockType H6
    // eslint-disable-next-line no-console
    console.warn('Unsupported headline level: ' + level + ' (supported are 1-6), defaulting to level 6')
    return BlockType.H6
  }
}
