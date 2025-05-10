const MIN_DIGIT_CHAR_CODE = 48
const MAX_DIGIT_CHAR_CODE = 57
const WHITESPACE_CHAR_CODE = 32
const TAB_CHAR_CODE = 9
const DOT_CHAR_CODE = 46

export function removeLeadingWhitespaces(str: string): string {
  while (str.charCodeAt(0) === WHITESPACE_CHAR_CODE) {
    str = str.substring(1, str.length)
  }
  return str
}

export function removeTrailingWhitespaces(str: string): string {
  while (str.charCodeAt(str.length - 1) === WHITESPACE_CHAR_CODE) {
    str = str.substring(0, str.length - 1)
  }
  return str
}

export function isDigit(charCode: number): boolean {
  return charCode >= MIN_DIGIT_CHAR_CODE && charCode <= MAX_DIGIT_CHAR_CODE
}

export function isNumber(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    if (!isDigit(charCode)) {
      return false
    }
  }
  return true
}

export function hasOnly(str: string, char: string): boolean {
  const charCode = char.charCodeAt(0)
  for (let i = 0; i < str.length; i++) {
    const aCharCode = str.charCodeAt(i)
    if (aCharCode !== charCode) {
      return false
    }
  }
  return true
}

export function hasUpperCaseCharacterInMiddleOfWord(text: string): boolean {
  let beginningOfWord = true
  for (let i = 0; i < text.length; i++) {
    const character = text.charAt(i)
    if (character === ' ') {
      beginningOfWord = true
    } else {
      if (!beginningOfWord && isNaN(character as any * 1) && character === character.toUpperCase() && character.toUpperCase() !== character.toLowerCase()) {
        return true
      }
      beginningOfWord = false
    }
  }
  return false
}

export function normalizedCharCodeArray(str: string): number[] {
  str = str.toUpperCase()
  return charCodeArray(str).filter(charCode => charCode !== WHITESPACE_CHAR_CODE && charCode !== TAB_CHAR_CODE && charCode !== DOT_CHAR_CODE)
}

export function charCodeArray(str: string): number[] {
  const charCodes: number[] = []
  for (let i = 0; i < str.length; i++) {
    charCodes.push(str.charCodeAt(i))
  }
  return charCodes
}

export function prefixAfterWhitespace(prefix: string, str: string): string {
  if (str.charCodeAt(0) === WHITESPACE_CHAR_CODE) {
    str = removeLeadingWhitespaces(str)
    return ' ' + prefix + str
  } else {
    return prefix + str
  }
}

export function suffixBeforeWhitespace(str: string, suffix: string): string {
  if (str.charCodeAt(str.length - 1) === WHITESPACE_CHAR_CODE) {
    str = removeTrailingWhitespaces(str)
    return str + suffix + ' '
  } else {
    return str + suffix
  }
}

export function isListItemCharacter(str: string): boolean {
  if (str.length > 1) {
    return false
  }
  const char = str.charAt(0)
  return char === '-' || char === '•' || char === '–'
}

export function isListItem(str: string): boolean {
  return /^[\s]*[-•–][\s].*$/g.test(str)
}

export function isNumberedListItem(str: string): boolean {
  return /^[\s]*[\d]*[.][\s].*$/g.test(str)
}

export function wordMatch(string1: string, string2: string): number {
  const words1 = new Set(string1.toUpperCase().split(' '))
  const words2 = new Set(string2.toUpperCase().split(' '))
  const intersection = new Set(
    [...words1].filter(x => words2.has(x)))
  return intersection.size / Math.max(words1.size, words2.size)
} 
