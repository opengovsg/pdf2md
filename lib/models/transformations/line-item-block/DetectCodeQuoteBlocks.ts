import ToLineItemBlockTransformation from '../ToLineItemBlockTransformation'
import ParseResult from '../../ParseResult'
import LineItem from '../../LineItem'
import LineItemBlock from '../../LineItemBlock'
import { DETECTED_ANNOTATION } from '../../Annotation'
import BlockType from '../../markdown/BlockType'

interface Globals {
  mostUsedHeight: number
}

function looksLikeCodeBlock(minX: number, items: LineItem[], mostUsedHeight: number): boolean {
  if (items.length === 0) {
    return false
  }
  if (items.length === 1) {
    return items[0].x > minX && items[0].height <= mostUsedHeight + 1
  }
  for (const item of items) {
    if (item.x === minX) {
      return false
    }
  }
  return true
}

function findMinX(blocks: LineItemBlock[]): number {
  let minX = 999
  blocks.forEach(block => {
    block.items.forEach(item => {
      minX = Math.min(minX, item.x)
    })
  })
  return minX === 999 ? 0 : minX
}

// Detect items which are code/quote blocks
export default class DetectCodeQuoteBlocks extends ToLineItemBlockTransformation {
  constructor() {
    super('$1')
  }

  transform(parseResult: ParseResult): ParseResult {
    const { mostUsedHeight } = parseResult.globals as Globals
    let foundCodeItems = 0
    parseResult.pages.forEach(page => {
      const blocks = page.items as unknown as LineItemBlock[]
      const minX = findMinX(blocks)
      blocks.forEach(block => {
        if (!block.type && looksLikeCodeBlock(minX, block.items, mostUsedHeight)) {
          block.annotation = DETECTED_ANNOTATION
          block.type = (BlockType as any).CODE
          foundCodeItems++
        }
      })
    })

    return new ParseResult({
      ...parseResult,
      messages: [
        'Detected ' + foundCodeItems + ' code/quote items.',
      ],
    })
  }
} 
