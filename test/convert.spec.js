const { expect } = require('chai')
const fs = require('fs')
const pdf2md = require('../')
const path = require('path')

describe('convert pdf to markdown', () => {
  it('should convert the pdf to markdown', async () => {
    const filePath = path.resolve(__dirname, '../examples/ExamplePdf.pdf')

    const pdfBuffer = new Uint8Array(fs.readFileSync(filePath))
    const text = await pdf2md(pdfBuffer)
    fs.writeFileSync('./test/output.md', text)
    console.log(text)

    expect(text.includes(" ")).to.equal(true)
  })
})