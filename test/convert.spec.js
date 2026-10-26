const { expect } = require('chai')
const fs = require('fs')
const pdf2md = require('../')
const path = require('path')

describe('integration test: convert pdf to markdown', () => {
  it('should convert the pdf to markdown', async () => {
    const filePath = path.resolve(__dirname, '../examples/ExamplePdf.pdf')

    const pdfBuffer = new Uint8Array(fs.readFileSync(filePath))
    const text = await pdf2md(pdfBuffer)

    expect(text.includes(" ")).to.equal(true)
  })

  it('should keep bold and italic text', async () => {
    const filePath = path.resolve(__dirname, '../examples/ExamplePdf.pdf')

    const pdfBuffer = new Uint8Array(fs.readFileSync(filePath))
    const text = await pdf2md(pdfBuffer)

    expect(text).to.include('Etwas _kursiv_ ist auch nicht schlecht.')
    expect(text).to.include('**Fett** ist auch interessant.')
    expect(text).to.include('**_FETTUNDKURSIV_**')
  })
})
