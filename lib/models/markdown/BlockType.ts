import { Enumify } from 'enumify'
import LineItemBlock from '../LineItemBlock'
import LineItem from '../LineItem'
import Word from '../Word'

function firstFormat(lineItem: LineItem) {
  if (lineItem.words.length === 0) {
    return null
  }
  return lineItem.words[0].format
}

function isPunctationCharacter(string: string): boolean {
  if (string.length !== 1) {
    return false
  }
  return string[0] === '.' || string[0] === '!' || string[0] === '?'
}

function linesToText(lineItems: LineItem[], disableInlineFormats?: boolean): string {
  let text = ''
  let openFormat: any = null

  const closeFormat = () => {
    if (openFormat) {
      text += openFormat.endSymbol
      openFormat = null
    }
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

interface BlockTypeProps {
  headline?: boolean
  headlineLevel?: number
  mergeToBlock?: boolean
  mergeFollowingNonTypedItems?: boolean
  mergeFollowingNonTypedItemsWithSmallDistance?: boolean
  toText: (block: LineItemBlock) => string
}

// An Markdown block
class BlockType extends Enumify {
  headline?: boolean
  headlineLevel?: number
  mergeToBlock?: boolean
  mergeFollowingNonTypedItems?: boolean
  mergeFollowingNonTypedItemsWithSmallDistance?: boolean
  toText!: (block: LineItemBlock) => string

  H1 = {
    headline: true,
    headlineLevel: 1,
    toText(block: LineItemBlock): string {
      return '# ' + linesToText(block.items, true)
    },
  };
  H2 = {
    headline: true,
    headlineLevel: 2,
    toText(block: LineItemBlock): string {
      return '## ' + linesToText(block.items, true)
    },
  };
  H3 = {
    headline: true,
    headlineLevel: 3,
    toText(block: LineItemBlock): string {
      return '### ' + linesToText(block.items, true)
    },
  };
  H4 = {
    headline: true,
    headlineLevel: 4,
    toText(block: LineItemBlock): string {
      return '#### ' + linesToText(block.items, true)
    },
  };
  H5 = {
    headline: true,
    headlineLevel: 5,
    toText(block: LineItemBlock): string {
      return '##### ' + linesToText(block.items, true)
    },
  };
  H6 = {
    headline: true,
    headlineLevel: 6,
    toText(block: LineItemBlock): string {
      return '###### ' + linesToText(block.items, true)
    },
  };
  TOC = {
    mergeToBlock: true,
    toText(block: LineItemBlock): string {
      return linesToText(block.items, true)
    },
  };
  FOOTNOTES = {
    mergeToBlock: true,
    mergeFollowingNonTypedItems: true,
    toText(block: LineItemBlock): string {
      return linesToText(block.items, false)
    },
  };
  CODE = {
    mergeToBlock: true,
    toText(block: LineItemBlock): string {
      return '```\n' + linesToText(block.items, true) + '```'
    },
  };
  LIST = {
    mergeToBlock: false,
    mergeFollowingNonTypedItemsWithSmallDistance: true,
    toText(block: LineItemBlock): string {
      return linesToText(block.items, false)
    },
  };
  PARAGRAPH = {
    toText(block: LineItemBlock): string {
      return linesToText(block.items, false)
    },
  };

}

// Create a namespace with the same name as the class to mimic static properties
// namespace BlockType {
//   export const H1 = (BlockType as any).H1 as BlockType
//   export const H2 = (BlockType as any).H2 as BlockType
//   export const H3 = (BlockType as any).H3 as BlockType
//   export const H4 = (BlockType as any).H4 as BlockType
//   export const H5 = (BlockType as any).H5 as BlockType
//   export const H6 = (BlockType as any).H6 as BlockType
//   export const TOC = (BlockType as any).TOC as BlockType
//   export const FOOTNOTES = (BlockType as any).FOOTNOTES as BlockType
//   export const CODE = (BlockType as any).CODE as BlockType
//   export const LIST = (BlockType as any).LIST as BlockType
//   export const PARAGRAPH = (BlockType as any).PARAGRAPH as BlockType
// }

export function isHeadline(type: BlockType): boolean {
  return type && type.name.length === 2 && type.name[0] === 'H'
}

export function blockToText(block: LineItemBlock): string {
  if (!block.type) {
    return linesToText(block.items, false)
  }
  // Ensure block.type is a BlockType before accessing toText
  const blockType = block.type as unknown as BlockType;
  return blockType.toText(block)
}

export function headlineByLevel(level: number): BlockType {
  if (level === 1) {
    return (BlockType as any).H1 as BlockType
  } else if (level === 2) {
    return (BlockType as any).H2 as BlockType
  } else if (level === 3) {
    return (BlockType as any).H3 as BlockType
  } else if (level === 4) {
    return (BlockType as any).H4 as BlockType
  } else if (level === 5) {
    return (BlockType as any).H5 as BlockType
  } else if (level === 6) {
    return (BlockType as any).H6 as BlockType
  } else {
    // if level is >= 6, just use BlockType H6
    // eslint-disable-next-line no-console
    console.warn('Unsupported headline level: ' + level + ' (supported are 1-6), defaulting to level 6')
    return (BlockType as any).H6 as BlockType
  }
}

export default BlockType 
