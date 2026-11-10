const { expect } = require('chai')

const DetectListLevels = require('../../lib/models/transformations/line-item-block/DetectListLevels')
const ParseResult = require('../../lib/models/ParseResult')
const Page = require('../../lib/models/Page')
const LineItem = require('../../lib/models/LineItem')
const LineItemBlock = require('../../lib/models/LineItemBlock')
const BlockType = require('../../lib/models/markdown/BlockType')
const { blockToText } = require('../../lib/models/markdown/BlockType')

// A list item block: the first line starts the item, any further lines are wrapped text
const listItem = (x, y, text, ...wrappedLines) => new LineItemBlock({
  items: [new LineItem({ x, y, text, type: BlockType.LIST })]
    .concat(wrappedLines.map((line, i) => new LineItem({ x: line.x, y: y - 14 * (i + 1), text: line.text }))),
})
const paragraph = (x, y, text) => new LineItemBlock({ items: [new LineItem({ x, y, text })] })

const levelLists = (...blocks) => {
  const parseResult = new ParseResult({ pages: [new Page({ index: 0, items: blocks })] })
  return new DetectListLevels().transform(parseResult).pages[0].items.map(blockToText)
}

describe('DetectListLevels', () => {
  it('nests items by their x position and steps back out', () => {
    expect(levelLists(
      listItem(57, 700, '- One'),
      listItem(69, 686, '- One.One'),
      listItem(81, 672, '- One.One.One'),
      listItem(69, 658, '- One.Two'),
      listItem(57, 644, '- Two'),
    )).to.eql([
      '- One\n',
      '  - One.One\n',
      '    - One.One.One\n',
      '  - One.Two\n',
      '- Two\n',
    ])
  })

  it('steps back out more than one level at once', () => {
    expect(levelLists(
      listItem(57, 700, '- One'),
      listItem(69, 686, '- One.One'),
      listItem(81, 672, '- One.One.One'),
      listItem(57, 658, '- Two'),
    )).to.eql(['- One\n', '  - One.One\n', '    - One.One.One\n', '- Two\n'])
  })

  it('does not indent wrapped lines or let them change the level', () => {
    expect(levelLists(
      listItem(57, 700, '- One that is long', { x: 69, text: 'enough to wrap' }),
      listItem(57, 672, '- Two'),
    )).to.eql(['- One that is long\nenough to wrap\n', '- Two\n'])
  })

  it('keeps items a point or two apart on the same level', () => {
    expect(levelLists(
      listItem(57, 700, '- One'),
      listItem(58, 686, '- Two'),
      listItem(56, 672, '- Three'),
    )).to.eql(['- One\n', '- Two\n', '- Three\n'])
  })

  it('indents sub-items of numbered items past the number', () => {
    expect(levelLists(
      listItem(57, 700, '9. Nine'),
      listItem(75, 686, '- Sub'),
      listItem(52, 672, '10. Ten'),
      listItem(75, 658, '- Sub'),
    )).to.eql(['9. Nine\n', '   - Sub\n', '10. Ten\n', '    - Sub\n'])
  })

  it('starts over when an item is higher up the page than the one before (next column)', () => {
    expect(levelLists(
      listItem(57, 700, '- Left'),
      listItem(300, 700, '- Right'),
      listItem(312, 686, '- Right sub'),
    )).to.eql(['- Left\n', '- Right\n', '  - Right sub\n'])
  })

  it('starts over after a block that is not a list item', () => {
    expect(levelLists(
      listItem(57, 700, '- One'),
      paragraph(69, 686, 'Some text'),
      listItem(69, 672, '- Two'),
    )).to.eql(['- One\n', 'Some text\n', '- Two\n'])
  })
})
