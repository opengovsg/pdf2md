import Transformation from './Transformation'
import ParseResult from '../ParseResult'
import { blockToText } from '../markdown/BlockType'
import LineItemBlock from '../LineItemBlock'

interface TextBlock {
  category: string
  text: string
}

// Define a type for objects that have a name property
interface WithName {
  name: string
}

export default class ToTextBlocks extends Transformation {
  constructor() {
    super('To Text Blocks', 'TextBlock')
  }

  transform(parseResult: ParseResult): ParseResult {
    parseResult.pages.forEach(page => {
      const textItems: TextBlock[] = []
      page.items.forEach(block => {
        const lineItemBlock = block as unknown as LineItemBlock
        // TODO category to type (before have no unknowns, have paragraph)
        // Handle the case where type might be a string or an object with a name property
        let category = 'Unknown'

        if (lineItemBlock.type) {
          // Cast to any to avoid TypeScript errors when accessing properties
          const typeAny = lineItemBlock.type as any
          category = typeAny.name || String(typeAny)
        }

        textItems.push({
          category: category,
          text: blockToText(lineItemBlock),
        })
      })
      page.items = textItems as any
    })
    return new ParseResult({
      ...parseResult,
    })
  }
} 
