import Transformation from './Transformation'
import ParseResult from '../ParseResult'

interface TextBlock {
  category: string
  text: string
}

export default class ToMarkdown extends Transformation {
  constructor() {
    super('To Markdown', 'String')
  }

  transform(parseResult: ParseResult): ParseResult {
    parseResult.pages.forEach(page => {
      let text = ''
      page.items.forEach(block => {
        const textBlock = block as unknown as TextBlock

        // Concatenate all words in the same block, unless it's a Table of Contents block
        let concatText: string
        if (textBlock.category === 'TOC') {
          concatText = textBlock.text
        } else {
          concatText = textBlock.text.replace(/(\r\n|\n|\r)/gm, ' ')
        }

        // Concatenate words that were previously broken up by newline
        if (textBlock.category !== 'LIST') {
          concatText = concatText.split('- ').join('')
        }

        // Assume there are no code blocks in our documents
        if (textBlock.category === 'CODE') {
          concatText = concatText.split('`').join('')
        }

        text += concatText + '\n\n'
      })

      page.items = [text] as any
    })
    return new ParseResult({
      ...parseResult,
    })
  }
} 
