// We're creating a TypeScript-friendly version that works with the existing code
import { Enumify } from 'enumify'

export interface WordTypeProperties {
  attachWithoutWhitespace?: boolean
  plainTextFormat?: boolean
  toText: (string: string) => string
}

// An Markdown word element
class WordType extends Enumify {
  attachWithoutWhitespace?: boolean
  plainTextFormat?: boolean
  toText!: (string: string) => string

  LINK = {
    toText(string: string): string {
      return `[${string}](${string})`
    },
  };
  FOOTNOTE_LINK = {
    attachWithoutWhitespace: true,
    plainTextFormat: true,
    toText(string: string): string {
      return `^${string}`
      // return `<sup>[${string}](#${string})</sup>`
    },
  };
  FOOTNOTE = {
    toText(string: string): string {
      return `(^${string})`
    },
  };

}

// Create a namespace with the same name as the class to mimic static properties
// namespace WordType {
//   export const LINK = (WordType as any).LINK as WordType
//   export const FOOTNOTE_LINK = (WordType as any).FOOTNOTE_LINK as WordType
//   export const FOOTNOTE = (WordType as any).FOOTNOTE as WordType
// }

export default WordType 
