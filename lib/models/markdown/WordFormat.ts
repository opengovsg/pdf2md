// We're creating a TypeScript-friendly version that works with the existing code
import { Enum } from 'enumify'

export interface WordFormatProperties {
  startSymbol: string
  endSymbol: string
}

// The format of a word element
class WordFormat extends Enum {
  startSymbol!: string
  endSymbol!: string

  static enumValueOf(name: string): WordFormat | undefined {
    try {
      // Need to access the namespace object property rather than the class property
      return (WordFormat as any)[name];
    } catch (e) {
      return undefined;
    }
  }
}

// @ts-ignore: initEnum is added by Enumify at runtime
WordFormat.initEnum({
  BOLD: {
    startSymbol: '**',
    endSymbol: '**',
  },
  OBLIQUE: {
    startSymbol: '_',
    endSymbol: '_',
  },
  BOLD_OBLIQUE: {
    startSymbol: '**_',
    endSymbol: '_**',
  },
})

// Create a namespace with the same name as the class to mimic static properties
// namespace WordFormat {
//   export const BOLD = (WordFormat as any).BOLD as WordFormat
//   export const OBLIQUE = (WordFormat as any).OBLIQUE as WordFormat
//   export const BOLD_OBLIQUE = (WordFormat as any).BOLD_OBLIQUE as WordFormat
// }

export default WordFormat 
