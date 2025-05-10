import ToLineItemBlockTransformation from '../ToLineItemBlockTransformation'
import ParseResult from '../../ParseResult'
import LineItemBlock from '../../LineItemBlock'
import LineItem from '../../LineItem'
import PageItem from '../../PageItem'
import { DETECTED_ANNOTATION } from '../../Annotation'
import { minXFromPageItems } from '../../../util/page-item-functions'

interface GlobalStats {
  mostUsedDistance: number
  [key: string]: any
}

// Item with x coordinate
interface ItemWithX {
  x: number
  [key: string]: any
}

// Gathers lines to blocks
export default class GatherBlocks extends ToLineItemBlockTransformation {
  constructor() {
    super('Gather Blocks')
  }

  transform(parseResult: ParseResult): ParseResult {
    const globals = parseResult.globals as GlobalStats
    const { mostUsedDistance } = globals
    let createdBlocks = 0
    let lineItemCount = 0

    parseResult.pages.forEach(page => {
      lineItemCount += page.items.length
      const blocks: LineItemBlock[] = []
      let stashedBlock = new LineItemBlock({})

      const flushStashedItems = () => {
        if (stashedBlock.items.length > 1) {
          stashedBlock.annotation = DETECTED_ANNOTATION
        }

        blocks.push(stashedBlock)
        stashedBlock = new LineItemBlock({})
        createdBlocks++
      }

      // Cast page items to ensure they have x property
      const itemsWithX = page.items.map(item => item as unknown as ItemWithX)
      const minX = minXFromPageItems(itemsWithX) || 0 // Default to 0 if null

      page.items.forEach(item => {
        const lineItem = item as unknown as LineItem
        if (stashedBlock.items.length > 0 && shouldFlushBlock(stashedBlock, lineItem, minX, mostUsedDistance)) {
          flushStashedItems()
        }
        stashedBlock.addItem(lineItem)
      })

      if (stashedBlock.items.length > 0) {
        flushStashedItems()
      }

      page.items = blocks
    })

    return new ParseResult({
      ...parseResult,
      messages: ['Gathered ' + createdBlocks + ' blocks out of ' + lineItemCount + ' line items'],
    })
  }
}

function shouldFlushBlock(stashedBlock: LineItemBlock, item: LineItem, minX: number, mostUsedDistance: number): boolean {
  const blockType = stashedBlock.type as any
  if (blockType && blockType.mergeFollowingNonTypedItems && !item.type) {
    return false
  }

  const lastItem = stashedBlock.items[stashedBlock.items.length - 1]
  const hasBigDistance = bigDistance(lastItem, item, minX, mostUsedDistance)

  if (blockType && blockType.mergeFollowingNonTypedItemsWithSmallDistance && !item.type && !hasBigDistance) {
    return false
  }

  if (item.type !== stashedBlock.type) {
    return true
  }

  if (item.type) {
    const itemType = item.type as any
    return !itemType.mergeToBlock
  } else {
    return hasBigDistance
  }
}

function bigDistance(lastItem: LineItem, item: LineItem, minX: number, mostUsedDistance: number): boolean {
  const distance = lastItem.y - item.y
  if (distance < 0 - mostUsedDistance / 2) {
    // distance is negative - and not only a bit
    return true
  }

  let allowedDistance = mostUsedDistance + 1
  if (lastItem.x > minX && item.x > minX) {
    // intended elements like lists often have greater spacing
    allowedDistance = mostUsedDistance + mostUsedDistance / 2
  }

  if (distance > allowedDistance) {
    return true
  }

  return false
} 
