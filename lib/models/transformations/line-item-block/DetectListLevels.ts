import ToLineItemBlockTransformation from '../ToLineItemBlockTransformation'
import ParseResult from '../../ParseResult'
import LineItem from '../../LineItem'
import LineItemBlock from '../../LineItemBlock'
import Word from '../../Word'
import { MODIFIED_ANNOTATION, UNCHANGED_ANNOTATION } from '../../Annotation'
import BlockType from '../../markdown/BlockType'

// Cares for proper sub-item spacing/leveling
export default class DetectListLevels extends ToLineItemBlockTransformation {
  constructor() {
    super('Level Lists')
  }

  transform(parseResult: ParseResult): ParseResult {
    let listBlocks = 0
    let modifiedBlocks = 0
    parseResult.pages.forEach(page => {
      const blocks = page.items as unknown as LineItemBlock[]
      blocks.filter(block => block.type === BlockType.LIST.name).forEach(listBlock => {
        let lastItemX: number | undefined
        let currentLevel = 0
        const xByLevel: Record<number, number> = {}
        let modifiedBlock = false
        listBlock.items.forEach(item => {
          const isListItem = true
          if (lastItemX && isListItem) {
            if (item.x > lastItemX) {
              currentLevel++
              xByLevel[item.x] = currentLevel
            } else if (item.x < lastItemX) {
              currentLevel = xByLevel[item.x] || 0
            }
          } else {
            xByLevel[item.x] = 0
          }
          if (currentLevel > 0) {
            item.words = [
              new Word({ string: ' '.repeat(currentLevel * 3) }),
            ].concat(item.words)
            modifiedBlock = true
          }
          lastItemX = item.x
        })
        listBlocks++
        if (modifiedBlock) {
          modifiedBlocks++
          listBlock.annotation = MODIFIED_ANNOTATION
        } else {
          listBlock.annotation = UNCHANGED_ANNOTATION
        }
      })
    })

    return new ParseResult({
      ...parseResult,
      messages: ['Modified ' + modifiedBlocks + ' / ' + listBlocks + ' list blocks.'],
    })
  }
} 
