#!/usr/bin/env node

/* eslint no-console: 0 */

const pdf2md = require('./pdf2md')
const fs = require('fs')
const path = require('path')
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
    return outputPath + x.split(folderPath)[1].split('.')[0]
  })
  makeOutputDirs(allOutputPaths)
  createMarkdownFiles(allFilePaths, allOutputPaths)
}

function getFileAndFolderPaths (folderPath) {
  var filePaths = []
  var folderPaths = []
  var directoryItems = fs.readdirSync(folderPath)
  directoryItems.forEach(directoryItem => {
    const isDirectory = fs.lstatSync(folderPath + '/' + directoryItem).isDirectory()
    if (isDirectory) {
      folderPaths.push(folderPath + '/' + directoryItem)
    }
    if (directoryItem
      .split('.')
      .pop()
      .toLowerCase() === 'pdf') {
      filePaths.push(folderPath + '/' + directoryItem)
    }
  })
  return [filePaths, folderPaths]
}

function getAllFileAndFolderPaths (filePaths, folderPaths, recursive) {
  var allFolderPaths = folderPaths
  if (recursive) {
    while (allFolderPaths.length !== 0) {
      var nextFolderPaths = []
      allFolderPaths.forEach(folderPath => {
        const outputArray = getFileAndFolderPaths(folderPath)
        filePaths = filePaths.concat(outputArray[0])
        nextFolderPaths = nextFolderPaths.concat(outputArray[1])
        folderPaths = folderPaths.concat(outputArray[1])
      })
      allFolderPaths = nextFolderPaths
    }
  }
  return [filePaths, folderPaths]
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
      const text = await pdf2md(pdfBuffer, callbacks)
      const outputFile = allOutputPaths[i] + '.md'
      console.log(`Writing to ${outputFile}...`)
      fs.writeFileSync(path.resolve(outputFile), text)
      console.log('Done.')
    } catch (err) {
      console.error(err)
    }
  }
}
