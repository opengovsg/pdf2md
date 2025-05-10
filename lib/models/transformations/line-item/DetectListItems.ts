import ToLineItemTransformation from '../ToLineItemTransformation'
import ParseResult from '../../ParseResult'
import LineItem from '../../LineItem'
import Word from '../../Word'
import { REMOVED_ANNOTATION, ADDED_ANNOTATION, DETECTED_ANNOTATION } from '../../Annotation'
import BlockType from '../../markdown/BlockType'
import { isListItemCharacter, isNumberedListItem } from '../../../util/string-functions'

// Detect items starting with -, •, etc...
export default class DetectListItems extends ToLineItemTransformation {
  constructor() {
    super('Detect List Items')
  }

  transform(parseResult: ParseResult): ParseResult {
    let foundListItems = 0
    let foundNumberedItems = 0

    parseResult.pages.forEach(page => {
      const newItems: LineItem[] = []

      page.items.forEach(item => {
        const lineItem = item as unknown as LineItem
        newItems.push(lineItem)

        if (!lineItem.type) {
          const text = lineItem.text()
          if (lineItem.words.length > 0 && isListItemCharacter(lineItem.words[0].string)) {
            foundListItems++
            if (lineItem.words[0].string === '-') {
              lineItem.annotation = DETECTED_ANNOTATION
              lineItem.type = (BlockType as any).LIST
            } else {
              lineItem.annotation = REMOVED_ANNOTATION
              const newWords = lineItem.words.map(word => new Word({
                ...word,
              }))
              newWords[0].string = '-'
              newItems.push(new LineItem({
                ...lineItem,
                words: newWords,
                annotation: ADDED_ANNOTATION,
                type: (BlockType as any).LIST,
              }))
            }
          } else if (isNumberedListItem(text)) { // TODO check that starts with 1 (kala chakra)
            foundNumberedItems++
            lineItem.annotation = DETECTED_ANNOTATION
            lineItem.type = (BlockType as any).LIST
          }
        }
      })

      page.items = newItems as any
    })

    return new ParseResult({
      ...parseResult,
      messages: [
        'Detected ' + foundListItems + ' plain list items.',
        'Detected ' + foundNumberedItems + ' numbered list items.',
      ],
    })
  }
} 
