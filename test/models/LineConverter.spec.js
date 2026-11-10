const { expect } = require('chai')

const LineConverter = require('../../lib/models/LineConverter')
const TextItem = require('../../lib/models/TextItem')

const item = (x, y, width, height, text) => new TextItem({ x, y, width, height, text, font: 'f' })

describe('LineConverter', () => {
  it('does not turn a whitespace-only item into a footnote', () => {
    // A bullet, a blank item and the item text sitting 1pt lower, as PDF.js reports a list item
    const line = new LineConverter(new Map()).compact([
      item(57, 728, 4, 13, '-'),
      item(61, 728, 1, 0, ' '),
      item(69, 727, 44, 11, 'Eintrag 1'),
    ])

    expect(line.words.map(word => word.string)).to.eql(['-', 'Eintrag', '1'])
    expect(line.words.every(word => !word.type)).to.equal(true)
    expect(line.parsedElements.footnotes).to.eql([])
  })

  it('does not turn a whitespace-only item into a footnote link', () => {
    const line = new LineConverter(new Map()).compact([
      item(57, 728, 30, 11, 'Und jetzt'),
      item(87, 732, 1, 0, ''),
      item(90, 728, 30, 11, 'weiter'),
    ])

    expect(line.words.map(word => word.string)).to.eql(['Und', 'jetzt', 'weiter'])
    expect(line.parsedElements.footnoteLinks).to.eql([])
  })

  it('keeps words apart that are separated by empty items', () => {
    const line = new LineConverter(new Map()).compact([
      item(131, 700, 14, 11, 'The'),
      item(145, 700, 0, 11, ''),
      item(145, 700, 14, 11, 'Law'),
      item(159, 700, 0, 11, ''),
      item(159, 700, 14, 11, 'will'),
    ])

    expect(line.words.map(word => word.string)).to.eql(['The', 'Law', 'will'])
  })

  it('still detects a raised number as a footnote link', () => {
    const line = new LineConverter(new Map()).compact([
      item(57, 728, 40, 11, 'Und jetzt'),
      item(97, 732, 4, 7, '4'),
    ])

    expect(line.words.map(word => word.string)).to.eql(['Und', 'jetzt', '4'])
    expect(line.parsedElements.footnoteLinks).to.eql([4])
  })
})
