#!/usr/bin/env node

/* eslint no-console: 0 */

const fs = require('fs')
const path = require('path')

const pdf2md = require('./pdf2md')
const { getFileAndFolderPaths, getAllFileAndFolderPaths } = require('./util/cli')

var argv = require('minimist')(process.argv.slice(2))

if (!argv['inputFolderPath']) {
  console.log('Please specify inputFolderPath')
} else if (!argv['outputFolderPath']) {
  console.log('Please specify outputFolderPath')
} else if (typeof argv['recursive'] !== 'boolean' && argv['recursive'] !== undefined) {
  console.log('Add tag --recursive for recursive folder conversion, otherwise omit')
} else {
  const folderPath = argv['inputFolderPath']
  const outputPath = argv['outputFolderPath']
  const recursive = argv['recursive']
  run(folderPath, outputPath, recursive)
}

function run (folderPath, outputPath, recursive = true) {
  var [filePaths, folderPaths] = getFileAndFolderPaths(folderPath)
  var [allFilePaths] = getAllFileAndFolderPaths(filePaths, folderPaths, recursive)
  var allOutputPaths = allFilePaths.map(x => {
    const fileNameWithExtension = x.split(folderPath)[1]
    const fileNameWithoutExtension = fileNameWithExtension.slice(0, fileNameWithExtension.indexOf('.pdf'))
    return outputPath + fileNameWithoutExtension
  })
  makeOutputDirs(allOutputPaths)
  createMarkdownFiles(allFilePaths, allOutputPaths)
}

function makeOutputDirs (allOutputPaths) {
  allOutputPaths.forEach(outputPath => {
    outputPath = outputPath
      .split('/')
      .slice(0, -1)
      .join('/')
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }
  })
}

async function createMarkdownFiles (filePaths, allOutputPaths) {
  // If outputPath specified, supply callbacks to log progress
  for (let i = 0; i < filePaths.length; ++i) {
    const filePath = filePaths[i]
    const callbacks = allOutputPaths[i] && {}
    const pdfBuffer = fs.readFileSync(filePath)
    try {
      const text = await pdf2md(new Uint8Array(pdfBuffer), callbacks)
      const outputFile = allOutputPaths[i] + '.md'
      console.log(`Writing to ${outputFile}...`)
      fs.writeFileSync(path.resolve(outputFile), text)
      console.log('Done.')
    } catch (err) {
      console.error(err)
    }
  }
}
