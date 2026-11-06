const { expect } = require('chai')

const ToMarkdown = require('../../lib/models/transformations/ToMarkdown')
const ParseResult = require('../../lib/models/ParseResult')
const Page = require('../../lib/models/Page')

const toMarkdown = (...blocks) => {
  const parseResult = new ParseResult({ pages: [new Page({ index: 0, items: blocks })] })
  return new ToMarkdown().transform(parseResult).pages[0].items[0]
}

describe('ToMarkdown', () => {
  it('rejoins words hyphenated across a line break', () => {
    const text = toMarkdown({ category: 'PARAGRAPH', text: 'This new infor-\nmation is hyphen-\nated.\n' })

    expect(text).to.equal('This new information is hyphenated. \n\n')
  })

  it('keeps hyphens that are not at the end of a line', () => {
    const text = toMarkdown({ category: 'PARAGRAPH', text: 'From 2019 - 2021 and first- and\nsecond-order.\n' })

    expect(text).to.equal('From 2019 - 2021 and first- and second-order. \n\n')
  })

  it('keeps the hyphen when the next line starts with a capital letter', () => {
    const text = toMarkdown({ category: 'PARAGRAPH', text: 'Jean-\nPaul Sartre\n' })

    expect(text).to.equal('Jean- Paul Sartre \n\n')
  })

  it('rejoins hyphenated words in non-Latin scripts', () => {
    const text = toMarkdown({ category: 'PARAGRAPH', text: 'Straßen-\nbahn und при-\nмер\n' })

    expect(text).to.equal('Straßenbahn und пример \n\n')
  })

  it('leaves table of contents blocks unchanged', () => {
    const text = toMarkdown({ category: 'TOC', text: 'Intro-\nduction 1\n' })

    expect(text).to.equal('Intro-\nduction 1\n\n\n')
  })
})
