const { expect } = require('chai')
const fs = require('fs')
const pdf2md = require('../')
const path = require('path')

describe('integration test: nested lists', () => {
  // A one-page PDF made with reportlab. Bullets sit at x = 72, 90 and 108,
  // numbers at x = 72, and one item wraps onto a second line.
  it('should indent list items by their position on the page', async () => {
    const filePath = path.resolve(__dirname, 'fixtures/nested-lists.pdf')

    const pdfBuffer = new Uint8Array(fs.readFileSync(filePath))
    const text = await pdf2md(pdfBuffer)
    const lines = text.split('\n').map(line => line.trimEnd()).filter(line => line.length > 0)

    expect(lines.slice(1, 9)).to.eql([
      '- Clothes',
      '  - Shirts',
      '    - Two long-sleeved shirts for the cold evenings up in the mountains, and one short-sleeved shirt',
      '    - One rain jacket',
      '  - Shoes',
      '- Documents',
      '  - Passport',
      '- Snacks',
    ])
    expect(lines.slice(10, 15)).to.eql([
      '1. Lock the back door',
      '2. Check the windows',
      '   - Kitchen',
      '   - Bedroom',
      '3. Turn off the lights',
    ])
  })
})
